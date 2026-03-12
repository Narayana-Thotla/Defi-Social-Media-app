const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/lens", async (req, res) => {
  try {
    const response = await fetch("https://api-v2.lens.dev/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    // const data = await response.json();

    const text = await response.text();
    console.log(text);
    res.send(text);

    res.json(data);
  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("Lens proxy running on port 4000");
});
