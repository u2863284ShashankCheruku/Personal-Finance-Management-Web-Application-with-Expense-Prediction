from app import create_app

# Create Flask app instance using factory pattern
app = create_app()

if __name__ == "__main__":
    # Debug mode enabled for development (disable in production)
    app.run(debug=True)