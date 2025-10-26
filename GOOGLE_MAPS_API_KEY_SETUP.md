# Google Maps API Key Setup

## ✅ **API Key Received**

Your Google Maps API Key:
```
AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4
```

---

## 📝 **Setup Instructions**

### **Step 1: Add to .env File**

Add this line to your `.env` file in the project root:

```env
GOOGLE_MAPS_API_KEY=AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4
```

**Full .env Example:**
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/trafficslight
MONGO_URI=mongodb://localhost:27017/trafficslight

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_secure
JWT_EXPIRE=7d
ADMIN_JWT_SECRET=your_admin_jwt_secret_key_here_make_it_very_long_and_secure
ADMIN_JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4
```

---

### **Step 2: Enable Geocoding API**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Geocoding API"**
5. Click **Enable**

### **Step 3: Restrict API Key (Recommended)**

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **Application restrictions**:
   - Select **HTTP referrers**
   - Add your production domains
4. Under **API restrictions**:
   - Select **Restrict key**
   - Choose **Geocoding API**
5. Click **Save**

---

## 🎯 **Usage**

Once configured, you can use reverse geocoding in the GasStation model:

```javascript
const GasStation = require('./models/GasStation');

const station = await GasStation.findById(id);

// Get address from coordinates
const addressInfo = await station.getAddressFromCoordinates();

if (addressInfo.success) {
  console.log('Address:', addressInfo.formattedAddress);
  // "EDSA, Quezon City, Metro Manila, Philippines"
  
  console.log('City:', addressInfo.address.city);
  // "Quezon City"
  
  console.log('State:', addressInfo.address.state);
  // "Metro Manila"
  
  console.log('Country:', addressInfo.address.country);
  // "Philippines"
}
```

---

## ✅ **What's Configured**

- ✅ API Key provided
- ✅ Reverse geocoding method implemented in GasStation model
- ✅ Automatic address extraction from coordinates
- ✅ Comprehensive address components (street, city, state, country, postal code)

---

## 🔒 **Security Notes**

1. **Never commit .env file to git** (already in .gitignore)
2. **Restrict API key** to specific domains/services
3. **Monitor usage** in Google Cloud Console
4. **Set usage quotas** to prevent unexpected charges
5. **Rotate API key** if compromised

---

## 🎉 **Ready to Use!**

Add the API key to your `.env` file and the reverse geocoding feature will work automatically!

**The GasStation model can now convert coordinates to real addresses using Google Maps!** 🚀✨
