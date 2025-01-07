from flask import Flask, request, jsonify
import joblib
import pandas as pd


pipeline = joblib.load('lgbm_pipeline2.pkl')


app = Flask(__name__)

def preprocess_data(df):

    df['biasRatio'] = df['totalBoysRegistered'] / df['totalGirlsRegistered']
    
    def bias_type(row):
        
        male_percentage = row['totalBoysRegistered'] / (row['totalBoysRegistered'] + row['totalGirlsRegistered']) * 100
        female_percentage = row['totalGirlsRegistered'] / (row['totalBoysRegistered'] + row['totalGirlsRegistered']) * 100

        if male_percentage > 61:
            return 'Male biased', male_percentage, female_percentage
        elif female_percentage > 61:
            return 'Female biased', male_percentage, female_percentage
        elif 39 <= male_percentage <= 61 and 39 <= female_percentage <= 61:
            return 'Neutral', male_percentage, female_percentage
        else:
            return 'Neutral', male_percentage, female_percentage
    
    df['biasTypeLabel'], df['boysPercentage'], df['girlsPercentage'] = zip(*df.apply(bias_type, axis=1))
    return df

@app.route('/predict', methods=['POST'])
def predict_bias_label():
    data = request.get_json()

    input_df = pd.DataFrame([data])
    
    
    prediction = pipeline.predict(input_df[['totalRegistrations', 'totalBoysRegistered', 'totalGirlsRegistered']])


    processed_df = preprocess_data(input_df)
    bias_type_label = processed_df['biasTypeLabel'].iloc[0]
    boys_percentage = processed_df['boysPercentage'].iloc[0]
    girls_percentage = processed_df['girlsPercentage'].iloc[0]
    
    
    
    if boys_percentage > girls_percentage:
        bias_message = (
            f"The male registration rate is {boys_percentage:.2f}%, which is higher than the female registration rate of {girls_percentage:.2f}%. "
            f"This indicates a {bias_type_label} trend. "
            
        )
    elif girls_percentage > boys_percentage:
        bias_message = (
            f"The female registration rate is {girls_percentage:.2f}%, which is higher than the male registration rate of {boys_percentage:.2f}%. "
            f"This indicates a {bias_type_label} trend. "
        )
    else:
        bias_message = (
            f"The male and female registration rates are the same at {boys_percentage:.2f}%, indicating a neutral trend. "
            f"This balance suggests that registration opportunities are equitable for both genders, with no apparent bias in access or participation."
        )
    
    return jsonify({"biasTypeLabel": bias_type_label, "biasRatio": prediction[0], "biasMessage": bias_message})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
