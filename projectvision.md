# COMPREHENSIVE FINANCIAL / ECONOMIC / POLITICAL MODELING DASHBOARD
## Master Build Prompt for Coding Agent

---

## PROJECT OVERVIEW

Build a full-stack, production-grade **Quantitative Research & Intelligence Dashboard** — a unified environment for developing, backtesting, and visualizing financial, macroeconomic, and geopolitical models. The system should feel like a Bloomberg Terminal crossed with a modern data science IDE, with AI-native capabilities baked in at every layer.

**Stack:** React (Next.js 14, App Router) + Python FastAPI backend + PostgreSQL + Redis + Docker Compose. TypeScript throughout. Tailwind CSS + shadcn/ui for components. Recharts + D3.js + Plotly.js for visualization. Zustand for state management.

**Aesthetic:** Dark terminal-inspired with high-information density. Think: deep navy/charcoal base (#0D1117), electric cyan (#00F5FF) and amber (#FFB800) as primary accents, monospaced data displays (JetBrains Mono), clean sans-serif labels (IBM Plex Sans). No gradients-on-white. No purple. This should look like a serious research instrument.

---

## ARCHITECTURE

### Backend (Python / FastAPI)

```
/backend
  /api
    /routes         # REST endpoints
    /websockets     # Real-time streaming
  /models
    /financial      # Financial models
    /macro          # Macroeconomic models
    /political      # Political risk models
    /ml             # ML/AI models
  /data
    /fetchers       # API integrations
    /processors     # ETL pipelines
    /cache          # Redis caching layer
  /engine
    /backtester     # Backtesting engine
    /optimizer      # Portfolio optimizer
    /simulator      # Monte Carlo, scenario engine
  /llm
    /agents         # LLM agents and chains
    /tools          # Agent tools
```

### Frontend (Next.js / React)

```
/frontend
  /app
    /dashboard      # Main workspace
    /models         # Model builder
    /research       # Research assistant
    /backtest       # Backtesting lab
    /macro          # Macro explorer
    /risk           # Risk console
    /geopolitical   # Political risk map
  /components
    /charts         # Custom chart library
    /panels         # Dashboard panels
    /editor         # Model code editor
    /widgets        # Data widgets
```

---

## MODULE 1: DATA LAYER & API INTEGRATIONS

Implement a unified data fetching layer with the following integrations. All requests should be cached in Redis with configurable TTL. Implement a data normalization layer that converts all sources to a unified schema.

### Market Data APIs
- **Alpha Vantage** — equities, FX, crypto, technical indicators
- **Polygon.io** — real-time + historical tick data, options chains, news sentiment
- **Yahoo Finance (yfinance)** — supplementary OHLCV, fundamentals
- **Quandl / NASDAQ Data Link** — alternative data, futures
- **CoinGecko** — crypto market data
- **FRED (Federal Reserve Economic Data)** — 800,000+ macroeconomic series via `fredapi`
- **World Bank API** — global development indicators
- **BLS (Bureau of Labor Statistics)** — CPI, PPI, employment
- **Census Bureau API** — demographic, trade, economic data
- **OECD API** — international economic indicators
- **UN Comtrade** — global trade flows
- **OpenSecrets API** — political donations, lobbying data
- **GDELT Project** — global event data for geopolitical modeling
- **NewsAPI + MediaStack** — news aggregation for sentiment
- **SEC EDGAR** — filings, 10-K/10-Q parsing

### Data Schema (Unified)
Every data series must be stored with: `{ticker_or_series_id, source, frequency, unit, last_updated, data: [{timestamp, value, metadata}]}`. Build a DataStore registry UI where users can browse, search, and preview all available series.

---

## MODULE 2: FINANCIAL MODELING ENGINE

### 2A. Fundamental Analysis Suite

Implement a complete fundamental analysis pipeline:

**Valuation Models** (each with interactive inputs, sensitivity tables, tornado charts):
- DCF (Discounted Cash Flow) with multi-stage growth, WACC decomposition, terminal value sensitivity
- DDM (Dividend Discount Model) — Gordon Growth, H-Model, multi-stage
- EV/EBITDA, P/E, P/B, P/S, PEG comparables engine — pull peer group data automatically from Polygon
- Residual Income Model (Edwards-Bell-Ohlson)
- Sum-of-parts (SOTP) valuation builder
- LBO model skeleton with debt waterfall

**Financial Statement Analysis:**
- Auto-parse SEC EDGAR 10-K/10-Q filings using `sec-edgar-downloader` + LLM extraction
- Compute and visualize: DuPont decomposition (3-factor + 5-factor), Altman Z-Score, Piotroski F-Score, Beneish M-Score, Sloan Accruals Ratio
- Trend analysis: auto-flag anomalies in revenue, margins, FCF conversion, working capital
- Peer benchmarking: pull comps automatically, render radar charts for multi-metric comparison

### 2B. Technical Analysis Engine

Implement a full charting suite with:
- **Chart types:** Candlestick, Heikin-Ashi, Renko, Point & Figure, Kagi
- **Indicators (compute server-side using `pandas-ta` or `TA-Lib`):**
  - Trend: SMA, EMA, WMA, DEMA, TEMA, HullMA, VWAP, Ichimoku Cloud, Parabolic SAR, SuperTrend
  - Momentum: RSI, Stochastic, MACD, ROC, CCI, Williams %R, TSI, Ultimate Oscillator
  - Volatility: Bollinger Bands, ATR, Keltner Channels, Donchian Channels, Historical Vol, Realized Vol
  - Volume: OBV, VWAP, MFI, Accumulation/Distribution, CMF, VPVR (Volume Profile)
  - Custom indicator builder: Let users write Python expressions to create indicators (`close.rolling(20).mean() / close.rolling(50).mean()`)
- Multi-timeframe analysis panel
- Pattern recognition: use `TA-Lib` pattern functions (CDLENGULFING, CDLHAMMER, etc.) + overlay on chart
- Support/Resistance auto-detection using fractal pivots + K-means clustering on price levels

### 2C. Quantitative / Statistical Models

**Time Series Analysis:**
- ACF/PACF plots, ADF unit root test, KPSS test, PP test
- ARIMA / SARIMA modeling with auto-order selection (`pmdarima`)
- VAR (Vector Autoregression) for multi-series relationships
- Granger Causality testing with lag selection
- Cointegration testing (Engle-Granger, Johansen) — identify pairs
- Regime detection: Hidden Markov Models (`hmmlearn`) with state visualization
- Structural break detection: Bai-Perron, CUSUM, Zivot-Andrews

**Factor Models:**
- Fama-French 3, 5-factor model — pull factor data from Ken French's data library
- Carhart 4-factor (add momentum)
- Custom factor builder: let users define factors from any data series, run cross-sectional regressions
- PCA on returns matrix — visualize factor loadings, explained variance, scree plot
- Rolling factor exposure heatmap over time

**Volatility Models:**
- GARCH(p,q), EGARCH, GJR-GARCH using `arch` library
- Realized volatility: 5-min RV, bipower variation, jump component
- Volatility surface construction from options data (implied vol by strike/expiry)
- VIX term structure and vol regime analysis

**Fixed Income:**
- Yield curve construction (Nelson-Siegel-Svensson fitting)
- Duration, modified duration, convexity, DV01
- Z-spread, OAS calculation
- Carry and roll-down analysis
- Fed Funds futures curve implied rate path
- 2s10s, 3m10y spread tracker with recession signal overlay

**Derivatives Pricing:**
- Black-Scholes-Merton (calls/puts) with Greeks (Delta, Gamma, Theta, Vega, Rho, Charm, Volga, Vanna)
- Binomial tree model
- Monte Carlo options pricing
- Greeks visualization: 3D surface plots (Strike × Time) using Plotly
- P&L scenario matrix (price × vol grid)

---

## MODULE 3: PORTFOLIO & RISK ENGINE

### 3A. Portfolio Construction

- **Mean-Variance Optimization (Markowitz):** Efficient frontier visualization, minimum variance portfolio, maximum Sharpe ratio — use `PyPortfolioOpt`
- **Black-Litterman Model:** Full implementation with view input UI, posterior return/covariance computation
- **Risk Parity:** Equal risk contribution portfolio
- **Kelly Criterion:** Full Kelly + fractional Kelly position sizing
- **CVaR/ES optimization:** Minimize Conditional Value at Risk
- **Constraints builder:** UI to add long-only, weight bounds, sector limits, turnover constraints

### 3B. Risk Analytics

- **VaR methods:** Parametric (variance-covariance), Historical Simulation, Monte Carlo VaR — all with configurable confidence levels and horizons
- **Stress Testing:** Pre-built scenarios (2008 GFC, 2020 COVID, 2022 rate shock, dot-com bust) + custom scenario builder
- **Correlation matrix:** Dynamic heatmap with hierarchical clustering dendrogram, rolling correlation
- **Beta decomposition:** Market beta, sector beta, factor beta
- **Drawdown analysis:** Max drawdown, Calmar ratio, underwater equity curve
- **Liquidity risk:** Days-to-liquidate estimates, bid-ask spread impact

### 3C. Performance Attribution

- Brinson-Hood-Beebower attribution (allocation, selection, interaction effects)
- Factor attribution against chosen benchmark
- Rolling Sharpe, Sortino, Treynor ratios
- Batting average, win/loss ratio, profit factor

---

## MODULE 4: BACKTESTING LAB

Build a full backtesting engine with the following architecture:

**Engine Requirements:**
- Event-driven backtester (not vectorized — proper order handling)
- Support: equities, ETFs, futures, FX, crypto
- Order types: Market, Limit, Stop, Stop-Limit, VWAP, TWAP
- Slippage models: fixed bps, square-root market impact model
- Transaction cost models: tiered commission schedules
- Corporate actions: splits, dividends (total return mode)
- Portfolio-level: multi-asset, rebalancing schedules

**Strategy Builder (Python IDE in browser using Monaco Editor):**
```python
# Example strategy interface
class MyStrategy(BaseStrategy):
    def initialize(self):
        self.sma_fast = SMA(20)
        self.sma_slow = SMA(50)
    
    def on_bar(self, bar):
        if self.sma_fast.value > self.sma_slow.value:
            self.buy(bar.symbol, weight=0.1)
        else:
            self.sell(bar.symbol)
```

**Results Dashboard:**
- Equity curve (vs. benchmark)
- Full tear sheet: annualized return, vol, Sharpe, Sortino, Calmar, max drawdown, recovery time
- Monthly returns heatmap (year × month)
- Trade log: entry/exit, holding period, P&L, MAE/MFE
- Distribution of returns (histogram + QQ plot)
- Walk-forward optimization panel
- Monte Carlo simulation of strategy (randomize trade order, bootstrap)

**Optimization:**
- Grid search over parameter space with 3D surface visualization
- Bayesian optimization using `optuna`
- Genetic algorithm for strategy evolution
- Out-of-sample / walk-forward validation with IS/OOS split visualization
- Overfitting detection: deflated Sharpe ratio (Bailey & Lopez de Prado)

---

## MODULE 5: MACROECONOMIC MODELING

### 5A. Business Cycle Dashboard

- Recession probability models:
  - **Probit model** on yield curve (Estrella & Mishkin specification)
  - **Composite leading indicator** aggregation (Conference Board methodology)
  - **Markov-switching model** on GDP growth / unemployment
- NBER recession shading on all macro charts
- Phase classification: expansion, peak, contraction, trough — with current phase indicator

### 5B. Macro Factor Dashboard

Build an interactive panel for tracking and modeling:
- **Growth:** Real GDP, industrial production, PMI composite, retail sales
- **Inflation:** CPI (headline, core, super-core), PCE, PPI, breakevens (5y5y, 10y)
- **Labor:** Unemployment rate, participation rate, JOLTS, initial claims, wage growth
- **Monetary:** Fed Funds rate, M2, bank credit, SOFR, repo, financial conditions index (Chicago Fed)
- **External:** Trade balance, current account, dollar index (DXY), CNY/USD
- **Sentiment:** Conference Board consumer confidence, Michigan sentiment, CEO confidence

For each macro factor: historical chart with recession shading, YoY change, Z-score vs. 10-year history, correlation matrix with asset classes.

### 5C. Econometric Models

- **OLS/WLS/GLS regression** with full diagnostic suite: residual plots, normality tests (Jarque-Bera, Shapiro-Wilk), heteroskedasticity tests (Breusch-Pagan, White), autocorrelation (Durbin-Watson, Breusch-Godfrey), multicollinearity (VIF)
- **Panel data models:** Fixed effects, random effects, Hausman test — for cross-country or cross-sector analysis
- **Instrumental variables / 2SLS** for endogeneity correction
- **DSGE model visualization** — simplified New Keynesian model (IS curve, Phillips curve, Taylor rule) with interactive parameter sliders to visualize impulse response functions
- **Input-Output Analysis:** Leontief model using BEA I-O tables — shock propagation through sectors
- **Taylor Rule calculator:** Input parameters, compare to actual Fed Funds rate, compute policy gaps

---

## MODULE 6: POLITICAL & GEOPOLITICAL RISK ENGINE

### 6A. Geopolitical Risk Map

- Interactive world map (D3.js `d3-geo`) with:
  - Country-level political risk scores (pull from PRS Group methodology or replicate)
  - Conflict event density (GDELT data — event counts by country, event type)
  - Trade dependency flows (UN Comtrade — export/import arrows between countries)
  - Sanctions exposure overlay
  - Election calendar with market impact historical analysis
- Click any country → country risk profile panel

### 6B. Political Risk Indicators

Compute and track (pulling from available sources):
- **V-Dem Dataset** indicators: liberal democracy index, electoral democracy, polyarchy score
- **Fragile States Index** components
- **Economic Policy Uncertainty Index** (Baker, Bloom, Davis — available from FRED)
- **Geopolitical Risk Index** (Caldara & Iacoviello — available from FRED series)
- **Political donations flows** via OpenSecrets API — track by industry, bill, politician
- **Lobbying spend** by sector over time
- **Regulatory risk scoring:** Track pending legislation, compute sector exposure

### 6C. Event-Driven Analysis

- Election event study tool: pick election dates, compute average asset returns in [-60, +60] day windows, display CAR (cumulative abnormal returns) with confidence bands
- Fed meeting event study: same framework for FOMC dates
- Geopolitical shock database: user can tag custom events and run event studies on any series
- News sentiment NLP pipeline: NewsAPI → `transformers` FinBERT → sentiment score time series → overlay on asset price chart

---

## MODULE 7: ML / AI / LLM ENGINE

### 7A. Machine Learning Models

**Supervised Learning for Asset Price / Return Prediction:**
- Feature engineering pipeline: technical indicators, macro factors, sentiment scores, calendar effects → feature matrix
- Models to implement and compare:
  - Ridge/Lasso/ElasticNet regression (with cross-validated alpha)
  - Random Forest, Extra Trees (with feature importance SHAP plots)
  - Gradient Boosting: XGBoost, LightGBM, CatBoost
  - Support Vector Regression (RBF kernel)
  - Multi-layer perceptron (PyTorch, configurable layers)
  - LSTM / GRU for sequence modeling (PyTorch)
  - Temporal Fusion Transformer (for multi-horizon forecasting)
- For each model: train/validation/test split with proper time-series cross-validation (purged K-fold, embargo gap), feature importance, SHAP waterfall plots, actual vs. predicted plot, residual analysis

**Unsupervised / Clustering:**
- K-Means, DBSCAN, Hierarchical clustering on return series or macro states
- t-SNE / UMAP for high-dimensional data visualization
- Regime clustering: cluster economic states using macro variables, visualize as state-space trajectory

**Reinforcement Learning (Advanced):**
- Basic RL portfolio agent using `stable-baselines3` + custom trading environment (gym interface)
- State: technical indicators + portfolio positions. Action: target weights. Reward: risk-adjusted return
- Training visualization: reward curve, portfolio evolution

### 7B. LLM Research Assistant

Integrate an LLM agent (OpenAI GPT-4o or Anthropic Claude API — configurable) with the following capabilities:

**Agent Tools (implement as LangChain / LangGraph tools):**
- `fetch_price_data(ticker, start, end, interval)` → returns OHLCV
- `fetch_macro_series(series_id, source)` → FRED, World Bank, etc.
- `run_regression(y_series, x_series_list, model_type)` → returns coefficients, R², diagnostics
- `run_backtest(strategy_code, symbols, start, end)` → returns performance metrics
- `compute_dcf(ticker, assumptions)` → returns valuation output
- `search_sec_filings(ticker, form_type, n)` → returns parsed filing text
- `fetch_news_sentiment(query, days)` → returns sentiment time series
- `generate_chart(data, chart_type, config)` → returns rendered chart

**Research Assistant UI:**
- Chat interface docked to right side of dashboard
- Can reference any panel/chart currently on screen ("analyze what's on my yield curve panel")
- Supports multi-step reasoning: "Build a DCF for AAPL, then run a sensitivity on WACC from 7-12%, then compare to current price and give me a view"
- Persist conversation + actions as a "Research Note" that can be exported to PDF
- **Hypothesis tester:** User states a macro/market hypothesis in plain text → LLM decomposes into testable claims → runs statistical tests → returns verdict with evidence

**Document Intelligence:**
- Upload any PDF (10-K, Fed minutes, IMF WEO, research paper) → LLM parses and creates structured summary
- Extract key metrics, forward guidance, risk factors automatically
- Q&A over uploaded documents using RAG (embedding store via `chromadb`, `text-embedding-ada-002` or local `all-MiniLM-L6-v2`)
- Compare two filings (e.g., two 10-Ks) and highlight material changes

---

## MODULE 8: VISUALIZATION & CHARTING STANDARDS

Every chart in the system must follow these standards:

**Chart Library Architecture:**
- Use **Recharts** for standard time series, bar, scatter charts in React
- Use **D3.js** for custom visualizations (yield curves, correlation networks, geo maps)
- Use **Plotly.js** for 3D surfaces (vol surface, optimization landscapes), heatmaps, and scientific plots
- Use **Monaco Editor** for in-browser code editing (strategy builder, custom indicator editor)

**Required Chart Types to Implement:**
- OHLCV Candlestick with volume bars and multi-indicator overlay
- Efficient frontier scatter with color-mapped Sharpe ratio
- 3D volatility surface (Strike × Expiry × IV)
- Yield curve animated time-lapse (watch curve evolve over months)
- Correlation matrix heatmap with hierarchical clustering
- Sankey diagram for sector/factor flow attribution
- Chord diagram for cross-asset correlation
- Network graph for contagion/interconnectedness analysis (D3 force-directed)
- Choropleth world map for geopolitical data
- Waterfall chart for return decomposition / DCF bridge
- QQ-plot and distribution overlay (normal, Student-t, skewed-t)
- Drawdown underwater chart
- Rolling metrics chart (Sharpe, beta, correlation over time)
- Regime visualization: hidden Markov state probabilities stacked area

**Design Standards:**
- All charts: dark background (#0D1117), grid lines (#1C2333), primary line (#00F5FF), secondary (#FFB800)
- Tooltips: detailed, formatted, show all relevant values
- All time series charts: synchronized crosshair when multiple panels on screen
- Zoom: brush-to-zoom on all charts, reset button
- Export: every chart exportable as PNG/SVG/CSV

---

## MODULE 9: WORKSPACE / LAYOUT SYSTEM

Build a fully configurable workspace using **react-grid-layout**:

- Drag-and-drop panel positioning and resizing
- Save/load workspace layouts (stored in PostgreSQL per user)
- Panel types that can be added: Chart, Model Builder, Data Table, News Feed, LLM Chat, Code Editor, Macro Indicator, Risk Summary, Watchlist
- Multiple workspace tabs (e.g., "Equity Research", "Macro View", "Risk Dashboard", "Backtest Lab")
- Full-screen mode for any panel
- Split-screen model editor with output preview
- Keyboard shortcuts for common actions

---

## MODULE 10: DATA PIPELINE & INFRASTRUCTURE

### Backend Infrastructure

- **PostgreSQL** (via `asyncpg`): Store timeseries data, user models, backtests, notes
- **Redis**: Cache API responses (TTL by data frequency), pub/sub for real-time streaming
- **Celery + Redis**: Async task queue for long-running jobs (backtests, ML training, data ingestion)
- **WebSockets** (FastAPI): Stream real-time price updates, backtest progress, ML training progress to frontend
- **Docker Compose**: Full local dev environment — frontend, backend, postgres, redis, celery worker

### Data Update Schedules (Celery Beat)
- Market prices: every 1 minute during market hours
- FRED series: daily at 9am ET
- SEC filings: daily scan for new filings
- News sentiment: every 15 minutes
- Alternative data: configurable per source

### Security & Auth
- JWT authentication (NextAuth.js on frontend, FastAPI-Users on backend)
- API key management for third-party services (stored encrypted in DB, never in frontend)
- Rate limiting on all endpoints
- Input validation and sanitization throughout

---

## MODULE 11: MODEL PERSISTENCE & COLLABORATION

- **Model registry:** Every model (DCF, backtest strategy, ML model, regression) can be saved, versioned, named, tagged
- **Parameter snapshots:** Save any model with its exact parameters and data inputs to reproduce results later
- **Export:** Any model output → PDF report (auto-generated with `ReportLab` or WeasyPrint), Excel (openpyxl), JSON
- **Notebooks:** Integration with Jupyter kernel — run cells inside the dashboard, results displayed inline
- **Version history:** Git-like snapshots of strategy code with diff viewer

---

## IMPLEMENTATION PRIORITY ORDER

Build in this sequence:

1. **Infrastructure:** Docker Compose, FastAPI skeleton, Next.js setup, PostgreSQL + Redis
2. **Data Layer:** FRED + Yahoo Finance + Alpha Vantage integrations, unified schema, caching
3. **Core Charts:** Candlestick chart, time series chart, basic OHLCV display
4. **Workspace Layout:** react-grid-layout, panel system, workspace persistence
5. **Technical Analysis:** Indicator engine (server-side), chart overlay system
6. **Fundamental Analysis:** DCF builder, financial statement parser, valuation comps
7. **Portfolio & Risk:** MVO optimizer, VaR engine, correlation matrix
8. **Backtesting Lab:** Event-driven engine, Monaco strategy editor, tear sheet
9. **Macro Module:** FRED dashboard, business cycle indicators, econometric tools
10. **ML Engine:** Feature pipeline, model training UI, SHAP explanations
11. **LLM Research Assistant:** Agent framework, tool integrations, RAG document Q&A
12. **Geopolitical Module:** World map, GDELT integration, political risk indicators
13. **Advanced Quant:** GARCH, regime detection, vol surface, fixed income
14. **Report Generation & Export**

---

## CRITICAL IMPLEMENTATION NOTES FOR THE CODING AGENT

- **Do not use placeholder/mock data** — wire to real APIs from day one. Use free tiers where available.
- **Every model must have uncertainty quantification** — confidence intervals, standard errors, or Monte Carlo bands on every output.
- **No hardcoded values** — all model parameters must be exposed in the UI with proper input validation.
- **Type everything** — strict TypeScript on frontend, Pydantic models on all FastAPI endpoints.
- **Test the math** — include unit tests for all quantitative functions (DCF NPV calculation, Black-Scholes pricing, Sharpe ratio, etc.) using `pytest`.
- **Logging** — structured logging throughout backend using `loguru`. Log all model runs with parameters and outputs.
- **Error handling** — graceful degradation when APIs are unavailable. Show data staleness timestamps.
- **Performance** — virtualize long lists/tables, paginate API responses, use WebWorkers for heavy frontend computation.
- **Mobile-aware but desktop-first** — the workspace is a desktop application; optimize for large screens.

---

## ENVIRONMENT VARIABLES REQUIRED

```env
# Market Data
POLYGON_API_KEY=
ALPHA_VANTAGE_API_KEY=
QUANDL_API_KEY=
FRED_API_KEY=

# LLM
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# News
NEWSAPI_KEY=

# Auth
JWT_SECRET=
NEXTAUTH_SECRET=

# DB
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/dashboard
REDIS_URL=redis://localhost:6379
```

---

*This dashboard should be the most capable open research environment ever built for individual quantitative analysts, macro researchers, and political economists. Build it like your career depends on it.*