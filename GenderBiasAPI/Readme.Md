
# Instructions to Run Jupyter Notebook and Flask API

## Running Jupyter Notebook in Kaggle

Kaggle provides a cloud-based environment to easily run Jupyter notebooks. Follow these steps to set up and run your notebook on Kaggle:

### Step 1: Create a Kaggle Account
- Sign up at [Kaggle](https://www.kaggle.com/) if you don't already have an account.

### Step 2: Upload Your Notebook
1. Log in to your Kaggle account.
2. Click on the **"New Notebook"** button on the Kaggle homepage.
3. Choose one of the following options:
   - **Upload an existing notebook**: Click the "Upload" button and select the notebook file from your local machine.
4. Wait for the notebook to be uploaded or initialized.

### Step 3: Upload the Required CSV File
1. Inside your notebook, go to the right-hand panel and click on the **"Add Data"** button.
2.   Under the **"Your Datasets"** section, upload your CSV file:
  - Click on the **Upload button.**
   - Drag and drop the CSV file or select it from your local machine.
4.   Once uploaded, Kaggle will automatically add it as a dataset and make it available to your notebook.

### Step 4: Run Your Notebook
- After uploading or creating your notebook, click **"Run All"** to execute all cells, or run individual cells by selecting them and clicking the **"Run"** button.
- Kaggle provides access to GPUs/CPUs depending on your selected environment (e.g., Kaggle Kernels).

---

## Running Flask API Locally

Follow these steps to set up and run a Python Flask API on your local machine:

### 1. Prerequisites

Ensure the following are installed:
- **Python 3.x**: [Download here](https://www.python.org/downloads/)
- **pip**: Python's package manager (included with Python installations)

### 2. Setting Up Your Flask Environment

#### Step 1: Install Flask
Open your terminal or command prompt and run:

```bash
pip install -r requirements.txt
```

#### Step 2: Run the Flask API

To start the Flask server, navigate to the directory containing your `api.py` file, then run:
```bash
python api.py
```