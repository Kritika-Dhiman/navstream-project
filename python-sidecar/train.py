import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score,classification_report
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

df=pd.read_csv("training_data.csv")

noise_idx = np.random.choice(df.index, size=int(0.05 * len(df)), replace=False)
df.loc[noise_idx, "anomaly"] = 1 - df.loc[noise_idx, "anomaly"]
X=df[
    [
        "voltage",
        "current",
        "temperature",
        "soc",
        "filteredCurrent",
        "powerExport",
        "soh"
    ]
]

y=df["anomaly"] 

X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)

model=RandomForestClassifier(n_estimators=100, random_state=2, class_weight="balanced")

model.fit(X_train,y_train)

initial_type=[("float_input", FloatTensorType([None,X.shape[1]]))]
options = {
    id(model): {
        "zipmap": False
    }
}

onnx_model=convert_sklearn(model,initial_types=initial_type,options=options)

predictions=model.predict(X_test)

accuracy=accuracy_score(y_test,predictions)

print(f"\n Accuracy : {accuracy*100:.2f}%\n")

print(classification_report(y_test,predictions))

with open("models/model.onnx","wb") as f:
    f.write(onnx_model.SerializeToString())
    
print("\n model.onnx exported successfully")