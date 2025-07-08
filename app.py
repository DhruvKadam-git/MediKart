from flask import Flask, render_template, jsonify, request, redirect, url_for

app = Flask(__name__, static_folder='js', static_url_path='/js')

@app.route('/')
def home():
    # Always redirect to the login page first. Client-side scripts will
    # itself redirect onward after successful authentication.
    return redirect(url_for('login'))

# New frontend routes
@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/index')
def index_page():
    """Landing page shown after successful authentication"""
    return render_template('index.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/checkout')
def checkout():
    return render_template('checkout.html')

@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    return render_template('product-detail.html', product_id=product_id)

@app.route('/userprofile')
def user_profile():
    return render_template('userprofile.html')

if __name__ == '__main__':
    app.run(debug=True)
