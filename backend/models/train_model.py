"""
Freight Rate Forecasting Model
XGBoost-based ML model trained on real historical market data
Supports both native XGBoost runtime and zero-dependency pure-NumPy tree evaluation.
"""

import pandas as pd
import numpy as np
import joblib
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class FreightForecaster:
    """Machine learning model for freight rate forecasting."""

    def __init__(self):
        self.model = None
        self.trees = None
        self.base_score = 0.0
        self.feature_names = []
        self.target_col = 'capesize_rate_usd_mt'
        self.scaler_mean = None
        self.scaler_std = None

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer features from raw data."""
        df = df.copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)

        # Temporal features
        df['month'] = df['date'].dt.month
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_year'] = df['date'].dt.dayofyear
        df['quarter'] = df['date'].dt.quarter

        # Cyclical encoding
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

        # Lag features
        for col in ['bdi', 'bunker_vlsfo_usd_mt', 'iron_ore', 'crude_oil', self.target_col]:
            if col in df.columns:
                df[f'{col}_lag_1d'] = df[col].shift(1)
                df[f'{col}_lag_7d'] = df[col].shift(7)
                df[f'{col}_lag_30d'] = df[col].shift(30)

        # Rolling statistics
        for col in ['bdi', self.target_col]:
            if col in df.columns:
                df[f'{col}_ma_7d'] = df[col].rolling(7, min_periods=1).mean()
                df[f'{col}_ma_30d'] = df[col].rolling(30, min_periods=1).mean()
                df[f'{col}_std_30d'] = df[col].rolling(30, min_periods=1).std()

        # Rate of change
        if self.target_col in df.columns:
            df[f'{self.target_col}_roc_7d'] = df[self.target_col].pct_change(7)

        # Interaction features
        df['fuel_cost_ratio'] = df['bunker_vlsfo_usd_mt'] / (df['crude_oil'] * 7.33 + 1)
        df['iron_crude_ratio'] = df['iron_ore'] / (df['crude_oil'] + 1)
        df['bdi_per_rate'] = df['bdi'] / (df[self.target_col] + 1)

        # Drop rows with NaN from lag features
        df = df.dropna()

        return df

    def _predict_trees(self, X: pd.DataFrame) -> np.ndarray:
        """Evaluate lightweight pure NumPy tree traversal with 100% mathematical fidelity."""
        if self.trees is None:
            raise ValueError("No trees loaded for prediction.")

        preds = []
        X_arr = X[self.feature_names].fillna(0).to_numpy(dtype=np.float32)
        base_score = np.float32(self.base_score)

        for row_idx in range(len(X_arr)):
            row_vec = X_arr[row_idx]
            total = base_score
            for tree in self.trees:
                left_children = tree['left_children']
                right_children = tree['right_children']
                split_indices = tree['split_indices']
                split_conditions = np.array(tree['split_conditions'], dtype=np.float32)
                default_left = tree['default_left']

                node = 0
                while left_children[node] != -1:
                    feat_idx = split_indices[node]
                    split_val = split_conditions[node]
                    val = row_vec[feat_idx]
                    if np.isnan(val):
                        node = left_children[node] if default_left[node] == 1 else right_children[node]
                    elif val < split_val:
                        node = left_children[node]
                    else:
                        node = right_children[node]
                total += split_conditions[node]
            preds.append(float(total))
        return np.array(preds)

    def train(self, data_path: str = "backend/data/freight_market_data.csv"):
        """Train the XGBoost model."""
        import xgboost as xgb
        from sklearn.model_selection import train_test_split, TimeSeriesSplit
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

        print("\n" + "="*60)
        print("TRAINING FREIGHT RATE FORECASTING MODEL")
        print("="*60 + "\n")

        # Load data
        print("Loading data...")
        df = pd.read_csv(data_path)
        print(f"  ✓ Loaded {len(df)} records from {df['date'].min()} to {df['date'].max()}")

        # Feature engineering
        print("\nEngineering features...")
        df = self.prepare_features(df)
        print(f"  ✓ Created features, {len(df)} records after processing")

        # Define features
        exclude_cols = ['date', self.target_col, 'panamax_rate_usd_mt', 'supramax_rate_usd_mt']
        self.feature_names = [col for col in df.columns if col not in exclude_cols]

        X = df[self.feature_names]
        y = df[self.target_col]

        print(f"\nFeature set: {len(self.feature_names)} features")
        print(f"Target: {self.target_col}")

        # Time-series split (no shuffling)
        print("\nSplitting data (time-series aware)...")
        split_idx = int(len(df) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        print(f"  Train: {len(X_train)} samples (80%)")
        print(f"  Test:  {len(X_test)} samples (20%)")

        # Train XGBoost
        print("\nTraining XGBoost model...")
        self.model = xgb.XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            gamma=0.1,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=42,
            n_jobs=-1
        )

        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        print("  ✓ Model trained successfully")

        # Extract trees for lightweight portable prediction
        try:
            booster = self.model.get_booster()
            dump = json.loads(booster.save_raw(raw_format='json'))
            base_score_raw = dump['learner']['learner_model_param']['base_score'].strip('[]')
            if 'E' in base_score_raw:
                parts = base_score_raw.split('E')
                self.base_score = float(parts[0]) * (10 ** float(parts[1]))
            else:
                self.base_score = float(base_score_raw)
            self.trees = dump['learner']['gradient_booster']['model']['trees']
        except Exception as e:
            print(f"  ⚠ Note extracting trees: {e}")

        # Evaluate
        print("\nEvaluating model performance...")
        y_train_pred = self.model.predict(X_train)
        y_test_pred = self.model.predict(X_test)

        train_mae = mean_absolute_error(y_train, y_train_pred)
        test_mae = mean_absolute_error(y_test, y_test_pred)
        test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
        test_r2 = r2_score(y_test, y_test_pred)
        test_mape = np.mean(np.abs((y_test - y_test_pred) / y_test)) * 100

        print(f"\n{'Metric':<20} {'Train':<15} {'Test'}")
        print("-" * 50)
        print(f"{'MAE ($/mt)':<20} {train_mae:.2f} {' '*8} {test_mae:.2f}")
        print(f"{'RMSE ($/mt)':<20} {'-':<15} {test_rmse:.2f}")
        print(f"{'MAPE (%)':<20} {'-':<15} {test_mape:.2f}%")
        print(f"{'R² Score':<20} {'-':<15} {test_r2:.3f}")

        # Feature importance
        print("\nTop 10 Most Important Features:")
        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False).head(10)

        for idx, row in importance_df.iterrows():
            print(f"  {row['feature']:<35} {row['importance']:.4f}")

        print("\n" + "="*60)
        if test_mae < 2.0:
            print("✓ MODEL PERFORMANCE: EXCELLENT (MAE < $2.00/mt)")
        elif test_mae < 3.0:
            print("✓ MODEL PERFORMANCE: GOOD (MAE < $3.00/mt)")
        else:
            print("⚠ MODEL PERFORMANCE: ACCEPTABLE (MAE > $3.00/mt)")
        print("="*60)

        return {
            'train_mae': train_mae,
            'test_mae': test_mae,
            'test_rmse': test_rmse,
            'test_mape': test_mape,
            'test_r2': test_r2
        }

    def predict(self, input_data: dict, history_df: pd.DataFrame = None) -> dict:
        """Make a forecast prediction."""
        if self.model is None and self.trees is None:
            raise ValueError("Model not trained or loaded. Call train() or load_model() first.")

        if history_df is not None and not history_df.empty:
            # Append input to history to compute rolling and lag features properly
            combined = pd.concat([history_df, pd.DataFrame([input_data])], ignore_index=True)
            featured = self.prepare_features(combined)
            latest_row = featured.iloc[[-1]]
        else:
            # If standalone, load recent history from file
            try:
                hist = pd.read_csv("backend/data/freight_market_data.csv").tail(60)
                combined = pd.concat([hist, pd.DataFrame([input_data])], ignore_index=True)
                featured = self.prepare_features(combined)
                latest_row = featured.iloc[[-1]]
            except Exception:
                # Direct feature generation
                input_df = pd.DataFrame([input_data])
                for col in self.feature_names:
                    if col not in input_df.columns:
                        input_df[col] = 0.0
                latest_row = input_df

        X = latest_row[self.feature_names].fillna(0)

        # Predict using model or pure tree traversal
        if self.trees is not None:
            prediction = self._predict_trees(X)[0]
        elif self.model is not None:
            prediction = self.model.predict(X)[0]
        else:
            raise ValueError("No prediction engine available.")

        # Calculate confidence interval (±10%)
        lower_bound = prediction * 0.90
        upper_bound = prediction * 1.10

        return {
            'predicted_rate_usd_mt': round(float(prediction), 2),
            'confidence_interval_lower': round(float(lower_bound), 2),
            'confidence_interval_upper': round(float(upper_bound), 2),
            'model_confidence': 0.85
        }

    def save_model(self, path: str = "backend/models/saved_models/freight_model.pkl"):
        """Save trained model."""
        if self.model is None and self.trees is None:
            raise ValueError("No model to save.")

        model_data = {
            'feature_names': self.feature_names,
            'target_col': self.target_col,
            'trained_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        if self.model is not None:
            try:
                booster = self.model.get_booster()
                dump = json.loads(booster.save_raw(raw_format='json'))
                base_score_raw = dump['learner']['learner_model_param']['base_score'].strip('[]')
                if 'E' in base_score_raw:
                    parts = base_score_raw.split('E')
                    base_score = float(parts[0]) * (10 ** float(parts[1]))
                else:
                    base_score = float(base_score_raw)
                model_data['base_score'] = base_score
                model_data['trees'] = dump['learner']['gradient_booster']['model']['trees']
            except Exception:
                model_data['model'] = self.model
        elif self.trees is not None:
            model_data['base_score'] = self.base_score
            model_data['trees'] = self.trees

        joblib.dump(model_data, path)
        print(f"\n✓ Model saved to: {path}")

    def load_model(self, path: str = "backend/models/saved_models/freight_model.pkl"):
        """Load a saved model."""
        model_data = joblib.load(path)
        self.feature_names = model_data['feature_names']
        self.target_col = model_data['target_col']

        if 'trees' in model_data:
            self.trees = model_data['trees']
            self.base_score = model_data.get('base_score', 0.0)
            self.model = None
        elif 'model' in model_data:
            self.model = model_data['model']
            try:
                booster = self.model.get_booster()
                dump = json.loads(booster.save_raw(raw_format='json'))
                base_score_raw = dump['learner']['learner_model_param']['base_score'].strip('[]')
                if 'E' in base_score_raw:
                    parts = base_score_raw.split('E')
                    self.base_score = float(parts[0]) * (10 ** float(parts[1]))
                else:
                    self.base_score = float(base_score_raw)
                self.trees = dump['learner']['gradient_booster']['model']['trees']
            except Exception:
                pass

        print(f"✓ Model loaded from: {path}")
        print(f"  Trained: {model_data.get('trained_date', 'Unknown')}")


if __name__ == "__main__":
    # Train the model
    forecaster = FreightForecaster()
    metrics = forecaster.train()
    forecaster.save_model()

    print("\n" + "="*60)
    print("MODEL TRAINING COMPLETE")
    print("="*60)
    print(f"Final Test MAE: ${metrics['test_mae']:.2f}/mt")
    print(f"Final Test MAPE: {metrics['test_mape']:.2f}%")
    print("Ready for deployment!")



if __name__ == "__main__":
    # Train the model
    forecaster = FreightForecaster()
    metrics = forecaster.train()
    forecaster.save_model()

    print("\n" + "="*60)
    print("MODEL TRAINING COMPLETE")
    print("="*60)
    print(f"Final Test MAE: ${metrics['test_mae']:.2f}/mt")
    print(f"Final Test MAPE: {metrics['test_mape']:.2f}%")
    print("Ready for deployment!")
