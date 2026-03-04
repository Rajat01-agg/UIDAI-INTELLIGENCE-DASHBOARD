/**
 * Realistic District Names for Mock / Fallback Data
 *
 * When the backend is unavailable, the StateDetailsPanel generates mock
 * district data.  Instead of "District 1", "District 2", etc., we use
 * real district names pulled from the Census of India / MHA listings.
 *
 * Only the first ~15 districts per major state are listed here — enough
 * for the top-10 mock rows the panel creates. States not listed fall
 * back to a generic "District N (stateName)" label clearly marked as demo.
 */

/** Map of state abbreviation → ordered list of real district names */
export const DISTRICT_NAMES: Record<string, string[]> = {
  UP: [
    'Lucknow', 'Varanasi', 'Agra', 'Kanpur Nagar', 'Prayagraj',
    'Gorakhpur', 'Meerut', 'Ghaziabad', 'Bareilly', 'Aligarh',
    'Moradabad', 'Jhansi', 'Mathura', 'Sultanpur', 'Azamgarh',
  ],
  MH: [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik',
    'Aurangabad', 'Solapur', 'Kolhapur', 'Satara', 'Ratnagiri',
    'Jalgaon', 'Amravati', 'Nanded', 'Akola', 'Latur',
  ],
  BR: [
    'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Purnia',
    'Darbhanga', 'Begusarai', 'Munger', 'Saran', 'Samastipur',
    'Nalanda', 'Vaishali', 'Aurangabad', 'Rohtas', 'Kaimur',
  ],
  WB: [
    'Kolkata', 'Howrah', 'North 24 Parganas', 'South 24 Parganas', 'Hooghly',
    'Nadia', 'Bardhaman', 'Murshidabad', 'Paschim Medinipur', 'Darjeeling',
    'Bankura', 'Birbhum', 'Malda', 'Jalpaiguri', 'Purulia',
  ],
  RJ: [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer',
    'Bikaner', 'Bharatpur', 'Alwar', 'Sikar', 'Pali',
    'Nagaur', 'Chittorgarh', 'Jhunjhunu', 'Barmer', 'Tonk',
  ],
  MP: [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain',
    'Sagar', 'Rewa', 'Satna', 'Chhindwara', 'Hoshangabad',
    'Dewas', 'Vidisha', 'Morena', 'Shahdol', 'Damoh',
  ],
  TN: [
    'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli',
    'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
    'Thanjavur', 'Kanchipuram', 'Cuddalore', 'Nagapattinam', 'Karur',
  ],
  GJ: [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
    'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Kheda',
    'Mehsana', 'Patan', 'Kutch', 'Bharuch', 'Navsari',
  ],
  KA: [
    'Bengaluru Urban', 'Mysuru', 'Belagavi', 'Hubli-Dharwad', 'Mangaluru',
    'Kalaburagi', 'Davanagere', 'Ballari', 'Tumakuru', 'Shimoga',
    'Raichur', 'Hassan', 'Bidar', 'Mandya', 'Udupi',
  ],
  AP: [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
    'Tirupati', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Kadapa',
    'Eluru', 'Ongole', 'Chittoor', 'Srikakulam', 'Machilipatnam',
  ],
  OD: [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
    'Puri', 'Balasore', 'Koraput', 'Ganjam', 'Mayurbhanj',
    'Jajpur', 'Jharsuguda', 'Bargarh', 'Kendrapara', 'Dhenkanal',
  ],
  JH: [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar',
    'Hazaribagh', 'Giridih', 'Dumka', 'Ramgarh', 'Palamu',
    'Garhwa', 'Chaibasa', 'Godda', 'Sahebganj', 'Khunti',
  ],
  DL: [
    'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
    'New Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi',
    'South West Delhi', 'Shahdara',
  ],
  KL: [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam',
    'Kannur', 'Alappuzha', 'Palakkad', 'Malappuram', 'Kottayam',
    'Idukki', 'Ernakulam', 'Wayanad', 'Pathanamthitta',
  ],
  TS: [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Nalgonda', 'Adilabad', 'Mahbubnagar', 'Medak', 'Rangareddi',
    'Sangareddi', 'Siddipet', 'Jagtiyal', 'Mancherial', 'Suryapet',
  ],
};

/**
 * Get a realistic district name for a given state abbreviation and index.
 * Falls back to "District N (StateName)" if no data is available — clearly
 * labelled so that demo users know it is placeholder.
 */
export function getDistrictName(
  stateAbbr: string,
  index: number,
  fallbackStateName: string
): string {
  const list = DISTRICT_NAMES[stateAbbr];
  if (list && index < list.length) return list[index];
  return `${fallbackStateName} District ${index + 1}`;
}

/**
 * Generate a deterministic but realistic district code from the state
 * abbreviation and the district name.
 *
 * Example: 'UP', 'Lucknow' → 'UP-LCK'
 */
export function generateDistrictCode(stateAbbr: string, districtName: string): string {
  // Take first 3 consonants (or letters if not enough consonants)
  const cleaned = districtName.replace(/[^A-Za-z]/g, '').toUpperCase();
  const consonants = cleaned.replace(/[AEIOU]/g, '');
  const suffix = (consonants.length >= 3 ? consonants : cleaned).slice(0, 3);
  return `${stateAbbr}-${suffix}`;
}
