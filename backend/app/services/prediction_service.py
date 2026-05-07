import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression


def preprocess_data(transactions):
    df = pd.DataFrame(transactions)

    if df.empty:
        return None

    # Parse dates robustly (handles ISO strings and datetime objects)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])

    if df.empty:
        return None

    df = df.sort_values('date')

    # Group by month using to_period — more stable than resample()
    df['year_month'] = df['date'].dt.to_period('M')
    monthly = df.groupby('year_month')['amount'].sum().reset_index()
    monthly = monthly[monthly['amount'] > 0]
    monthly = monthly.sort_values('year_month').reset_index(drop=True)

    return monthly


def predict_expenses(transactions):
    try:
        df = preprocess_data(transactions)

        # No data at all
        if df is None or len(df) == 0:
            return [0.0, 0.0, 0.0]

        # Only 1 month — return average safely
        if len(df) == 1:
            avg = float(df['amount'].mean())
            return [round(avg, 2), round(avg, 2), round(avg, 2)]

        # 2+ months — run Linear Regression on the trend
        df['t'] = np.arange(len(df))
        model = LinearRegression()
        model.fit(df[['t']], df['amount'])

        future_t = np.array([[len(df)], [len(df) + 1], [len(df) + 2]])
        raw_preds = model.predict(future_t)

        # Expenses can never be negative
        preds = [round(max(0.0, float(p)), 2) for p in raw_preds]
        return preds

    except Exception as e:
        print(f"[PredictionService] Error: {e}")
        try:
            values = [float(t['amount']) for t in transactions if t.get('amount')]
            avg = round(sum(values) / len(values), 2) if values else 0.0
            return [avg, avg, avg]
        except Exception:
            return [0.0, 0.0, 0.0]