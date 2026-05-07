from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt, bcrypt, cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)

    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.transaction_routes import transaction_bp
    from .routes.budget_routes import budget_bp
    from .routes.prediction_routes import prediction_bp
    from .routes.alert_routes import alert_bp
    from .routes.dashboard_routes import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(transaction_bp, url_prefix='/api/transactions')
    app.register_blueprint(budget_bp, url_prefix='/api/budget')
    app.register_blueprint(prediction_bp, url_prefix='/api/predict')
    app.register_blueprint(alert_bp, url_prefix='/api/alerts')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # AUTO CREATE TABLES (runs once when app starts)
    with app.app_context():
        db.create_all()

    return app