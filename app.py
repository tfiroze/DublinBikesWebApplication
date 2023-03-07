from flask import Flask, render_template

app = Flask(__name__)
app = Flask(__name__, template_folder='templates')
@app.route('/')
def map():
    return render_template('map.html')

if __name__ == '__main__':
    app.run(debug=True)
