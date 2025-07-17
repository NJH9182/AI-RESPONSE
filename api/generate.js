
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Review Response AI</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { font-size: 2.2em; margin-bottom: 10px; }
    .main { padding: 30px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; font-weight: bold; margin-bottom: 5px; }
    input, textarea, select {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 1em;
    }
    textarea { resize: vertical; }
    .rating-stars { display: flex; gap: 5px; font-size: 24px; margin-top: 5px; }
    .star { color: #ccc; cursor: pointer; }
    .star.active { color: #f5a623; }
    .btn { background: #27ae60; color: white; border: none; padding: 12px 20px; font-size: 16px; border-radius: 8px; cursor: pointer; }
    .btn:disabled { background: #aaa; cursor: not-allowed; }
    .response-box {
      margin-top: 30px;
      background: #f4f6f8;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #27ae60;
    }
    .btn-group { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; }
    .copy-btn { background: #3498db; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Review Response AI Agent</h1>
      <p>Create personalized responses to reviews — in any tone, style, or language!</p>
    </div>
    <div class="main">
      <div class="form-group">
        <label>Business Name</label>
        <input id="businessName" />
      </div>
      <div class="form-group">
        <label>Business Type</label>
        <select id="businessType">
          <option value="restaurant">Restaurant</option>
          <option value="hotel">Hotel</option>
          <option value="retail">Retail Store</option>
          <option value="salon">Salon/Spa</option>
          <option value="auto">Auto Service</option>
          <option value="healthcare">Healthcare</option>
          <option value="fitness">Fitness/Gym</option>
          <option value="professional">Professional Services</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Owner Name</label>
        <input id="ownerName" />
      </div>
      <div class="form-group">
        <label>Response Style</label>
        <select id="responseStyle">
          <option value="professional">Professional</option>
          <option value="friendly">Friendly & Casual</option>
          <option value="formal">Formal</option>
          <option value="warm">Warm & Personal</option>
        </select>
      </div>
      <div class="form-group">
        <label>Response Length</label>
        <select id="responseLength">
          <option value="short">Short</option>
          <option value="normal" selected>Normal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
      <div class="form-group">
        <label>Response Language</label>
        <select id="responseLanguage">
          <option value="English" selected>English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </select>
      </div>
      <div class="form-group">
        <label>Business Info (optional)</label>
        <textarea id="businessInfo" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Customer Name</label>
        <input id="customerName" />
      </div>
      <div class="form-group">
        <label>Rating</label>
        <div class="rating-stars">
          <span class="star" data-rating="1">★</span>
          <span class="star" data-rating="2">★</span>
          <span class="star" data-rating="3">★</span>
          <span class="star" data-rating="4">★</span>
          <span class="star" data-rating="5">★</span>
        </div>
      </div>
      <div class="form-group">
        <label>Review Text</label>
        <textarea id="reviewText" rows="4"></textarea>
      </div>
      <div class="form-group">
        <label>Review Platform</label>
        <select id="reviewPlatform">
          <option value="Google">Google</option>
          <option value="Yelp">Yelp</option>
          <option value="TripAdvisor">TripAdvisor</option>
        </select>
      </div>
      <button class="btn" onclick="generateResponse()">Generate Response</button>

      <div class="response-box" id="responseSection" style="display:none;">
        <h3>✨ Generated Response</h3>
        <textarea id="responseOutput" rows="6" style="width:100%; border:1px solid #ccc; border-radius:8px;"></textarea>
        <div class="btn-group">
          <button class="btn copy-btn" onclick="copyResponse()">Copy</button>
          <button class="btn" onclick="generateResponse()">Regenerate</button>
          <button class="btn" onclick="clearForm()">Clear</button>
        </div>
      </div>
    </div>
  </div>
  <script>
    let selectedRating = 0;
    document.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        document.querySelectorAll('.star').forEach((s, i) => s.classList.toggle('active', i < selectedRating));
      });
    });

    async function generateResponse() {
      const data = {
        businessName: document.getElementById('businessName').value,
        businessType: document.getElementById('businessType').value,
        ownerName: document.getElementById('ownerName').value,
        responseStyle: document.getElementById('responseStyle').value,
        responseLength: document.getElementById('responseLength').value,
        responseLanguage: document.getElementById('responseLanguage').value,
        businessInfo: document.getElementById('businessInfo').value,
        customerName: document.getElementById('customerName').value,
        reviewText: document.getElementById('reviewText').value,
        reviewPlatform: document.getElementById('reviewPlatform').value,
        rating: selectedRating
      };
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      document.getElementById('responseOutput').value = result.response;
      document.getElementById('responseSection').style.display = 'block';
    }

    function copyResponse() {
      const text = document.getElementById('responseOutput').value;
      navigator.clipboard.writeText(text).then(() => alert("✅ Copied to clipboard!"));
    }

    function clearForm() {
      document.querySelectorAll('input, textarea').forEach(el => el.value = '');
      selectedRating = 0;
      document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
      document.getElementById('responseSection').style.display = 'none';
    }
  </script>
</body>
</html>
