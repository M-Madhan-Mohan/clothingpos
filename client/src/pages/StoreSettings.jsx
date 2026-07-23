import { useEffect, useState } from "react";
import { FaCalendarAlt, FaEnvelope, FaHashtag, FaMapMarkerAlt, FaPhoneAlt, FaStore } from "react-icons/fa";
import "../styles/storeSettings.css";

const STORAGE_KEY = "clothing-pos-store-settings";
const defaultSettings = { storeName: "RS9 EXPORTS", storeAddress: "RAINTECH BUILDING, VADAYAR PO, KOTTAYAM, KERALA", contactNumber: "+91 8078311945", emailAddress: "raintechstore@gmail.com", gstin: "32AAAAA1111A1Z1" };

function StoreSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (!savedSettings) return;
    try { setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) }); }
    catch { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  const updateSetting = ({ target: { name, value } }) => {
    setSettings((current) => ({ ...current, [name]: value }));
    setMessage("");
  };
  const saveSettings = (event) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setMessage("Store configuration saved.");
  };

  return <section className="store-settings-page">
    <header className="store-settings-header"><div><h1>Store Configuration</h1><p>● RS9 EXPORTS</p></div><div className="store-date-chip"><FaCalendarAlt /> {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</div></header>
    <form className="store-settings-card" onSubmit={saveSettings}>
      <h2>Store Profile Settings</h2><div className="store-settings-rule" />
      <label className="store-field store-full-field"><span><FaStore /> Store Name</span><input name="storeName" value={settings.storeName} onChange={updateSetting} required /></label>
      <label className="store-field store-full-field"><span><FaMapMarkerAlt /> Store Address</span><textarea name="storeAddress" value={settings.storeAddress} onChange={updateSetting} rows="3" required /></label>
      <div className="store-two-columns"><label className="store-field"><span><FaPhoneAlt /> Contact Number</span><input name="contactNumber" value={settings.contactNumber} onChange={updateSetting} required /></label><label className="store-field"><span><FaEnvelope /> Email Address</span><input name="emailAddress" type="email" value={settings.emailAddress} onChange={updateSetting} required /></label></div>
      <label className="store-field store-full-field"><span><FaHashtag /> Store GSTIN Number</span><input name="gstin" value={settings.gstin} onChange={updateSetting} /></label>
      <div className="store-save-row">{message && <span role="status">{message}</span>}<button type="submit">Save Configuration</button></div>
    </form>
  </section>;
}

export default StoreSettings;
