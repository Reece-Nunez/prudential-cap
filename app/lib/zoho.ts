// Zoho CRM API integration

interface ZohoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZohoLeadData {
  [key: string]: string | number | boolean | undefined | null;
}

// Round-robin rep list
const ROUND_ROBIN_REPS = [
  { id: '6522534000001975859', name: 'Ruvim Popov' },
  { id: '6522534000003949131', name: 'David York' },
  { id: '6522534000004046003', name: 'Tyler Carullo' },
  { id: '6522534000022419009', name: 'Tom Jones' },
  { id: '6522534000022419092', name: 'Anna Knower' },
  { id: '6522534000035483004', name: 'Jacob Lowe' },
  { id: '6522534000048539135', name: 'Aleksandr Renfro' },
  { id: '6522534000052169051', name: 'Edwin Flores' },
  { id: '6522534000057753064', name: 'Kyle Payne' },
  { id: '6522534000060361064', name: 'Mauricio Rubschlager' },
  { id: '6522534000064990001', name: 'Michael Paez' },
  { id: '6522534000065165049', name: 'Jonathan Brown' },
  { id: '6522534000065165097', name: 'Piilani Harris' },
  { id: '6522534000066833011', name: 'Bradley Knodle' },
  { id: '6522534000066833163', name: 'Isaac Gaetano' },
  { id: '6522534000066833224', name: 'Casey Veach' },
  { id: '6522534000069690008', name: 'Mohammed Alheleji' },
  { id: '6522534000069690023', name: 'Monica Monroe' },
  { id: '6522534000069690038', name: 'Charles Ezekiel Hackney Jr' },
  { id: '6522534000069690053', name: 'Kellie Sutton-Thomas' },
  { id: '6522534000069690068', name: 'Zachary Parker' },
  { id: '6522534000069690083', name: 'Nelson Moore' },
  { id: '6522534000069690128', name: 'Elizabeth Perez' },
  { id: '6522534000069690143', name: 'Zeena Smiley' },
  { id: '6522534000069690371', name: 'Edric Williams' },
  { id: '6522534000069690386', name: 'Max Perron' },
  { id: '6522534000070969006', name: 'Kaitlyn Conley' },
  { id: '6522534000070969021', name: 'Kevin Le' },
  { id: '6522534000070969036', name: 'Kharion King-Kemp' },
];

interface ZohoCreateResponse {
  data: Array<{
    code: string;
    details: {
      id: string;
      Modified_Time: string;
      Created_Time: string;
    };
    message: string;
    status: string;
  }>;
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Zoho CRM credentials not configured');
  }

  const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Zoho access token: ${error}`);
  }

  const data: ZohoTokenResponse = await response.json();
  return data.access_token;
}

async function getNextRoundRobinRep(accessToken: string): Promise<{ id: string; name: string }> {
  try {
    const searchParams = new URLSearchParams({
      criteria: '(Lead_Source:equals:Prudential Capital Website - Funding Application)',
      sort_by: 'Created_Time',
      sort_order: 'desc',
      per_page: '1',
    });

    const response = await fetch(
      `https://www.zohoapis.com/crm/v2/Leads/search?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const lastOwnerId = result.data[0].Owner?.id;

        if (lastOwnerId) {
          const lastIndex = ROUND_ROBIN_REPS.findIndex(rep => rep.id === lastOwnerId);

          if (lastIndex !== -1) {
            const nextIndex = (lastIndex + 1) % ROUND_ROBIN_REPS.length;
            return ROUND_ROBIN_REPS[nextIndex];
          }
        }
      }
    }

    return ROUND_ROBIN_REPS[0];
  } catch (error) {
    console.error('Error getting round-robin rep:', error);
    return ROUND_ROBIN_REPS[0];
  }
}

async function uploadAttachmentToZoho(
  accessToken: string,
  recordId: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<boolean> {
  try {
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);

    const bodyParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
      `Content-Type: ${contentType}\r\n\r\n`,
    ];

    const bodyStart = Buffer.from(bodyParts.join(''));
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([bodyStart, fileBuffer, bodyEnd]);

    const response = await fetch(
      `https://www.zohoapis.com/crm/v2/Leads/${recordId}/Attachments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to upload attachment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return false;
  }
}

function findRepByName(name: string): { id: string; name: string } | null {
  if (!name || !name.trim()) return null;

  const normalizedSearch = name.trim().toLowerCase();

  const exactMatch = ROUND_ROBIN_REPS.find(
    rep => rep.name.toLowerCase() === normalizedSearch
  );
  if (exactMatch) return exactMatch;

  const partialMatch = ROUND_ROBIN_REPS.find(
    rep => rep.name.toLowerCase().includes(normalizedSearch) ||
           normalizedSearch.includes(rep.name.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  return null;
}

export async function createZohoLead(
  leadData: ZohoLeadData,
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>,
  fundingSpecialistName?: string
): Promise<{ success: boolean; leadId?: string; assignedTo?: string; error?: string; validationErrors?: string[]; rawResponse?: unknown }> {
  try {
    const validation = validateZohoLeadData(leadData);
    if (!validation.valid) {
      console.error('Zoho lead validation failed:', validation.errors);
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
        validationErrors: validation.errors
      };
    }

    const accessToken = await getAccessToken();

    let assignedRep: { id: string; name: string };
    const matchedRep = findRepByName(fundingSpecialistName || '');

    if (matchedRep) {
      assignedRep = matchedRep;
      console.log(`Funding specialist "${fundingSpecialistName}" matched to rep: ${assignedRep.name} (${assignedRep.id})`);
    } else {
      assignedRep = await getNextRoundRobinRep(accessToken);
      console.log(`No rep match for "${fundingSpecialistName || 'N/A'}". Using round-robin: ${assignedRep.name} (${assignedRep.id})`);
    }

    const leadWithOwner = {
      ...leadData,
      Owner: assignedRep.id,
    };

    const response = await fetch('https://www.zohoapis.com/crm/v2/Leads', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [leadWithOwner],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Zoho CRM API error:', error);
      return { success: false, error: `API error: ${response.status}` };
    }

    const result: ZohoCreateResponse = await response.json();

    console.log('[Zoho] Lead creation response:', JSON.stringify(result, null, 2));

    if (result.data && result.data[0]?.status === 'success') {
      const leadId = result.data[0].details.id;

      if (attachments && attachments.length > 0) {
        console.log(`Uploading ${attachments.length} attachment(s) to lead ${leadId}`);
        for (const attachment of attachments) {
          const uploaded = await uploadAttachmentToZoho(
            accessToken,
            leadId,
            attachment.filename,
            attachment.content,
            attachment.contentType
          );
          if (uploaded) {
            console.log(`Uploaded: ${attachment.filename}`);
          } else {
            console.error(`Failed to upload: ${attachment.filename}`);
          }
        }
      }

      return {
        success: true,
        leadId: leadId,
        assignedTo: assignedRep.name
      };
    }

    const errorData = result.data?.[0];
    const errorMessage = [
      errorData?.message || 'Unknown error',
      errorData?.code ? `(code: ${errorData.code})` : '',
      errorData?.details ? `details: ${JSON.stringify(errorData.details)}` : '',
    ].filter(Boolean).join(' ');

    return {
      success: false,
      error: errorMessage,
      rawResponse: result
    };
  } catch (error) {
    console.error('Error creating Zoho lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
]);

function parseAddress(address: string): { street: string; city: string; state: string; zip: string } {
  const result = { street: '', city: '', state: '', zip: '' };

  if (!address) return result;

  const parts = address.split(',').map(p => p.trim());

  if (parts.length >= 1) {
    result.street = parts[0];
  }
  if (parts.length >= 2) {
    result.city = parts[1];
  }
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    const stateZipMatch = lastPart.match(/^([A-Za-z]{2,})\s*(\d{5}(?:-\d{4})?)?$/);
    if (stateZipMatch) {
      const potentialState = stateZipMatch[1].toUpperCase();
      if (US_STATES.has(potentialState)) {
        result.state = potentialState;
      }
      result.zip = stateZipMatch[2] || '';
    } else {
      const upperLastPart = lastPart.toUpperCase();
      if (US_STATES.has(upperLastPart)) {
        result.state = upperLastPart;
      }
    }
  }

  return result;
}

function parseCurrency(value: string): number | null {
  if (!value) return null;
  const num = parseInt(value.replace(/[^0-9]/g, ''));
  return isNaN(num) || num === 0 ? null : num;
}

function parseEIN(value: string): number | null {
  if (!value) return null;
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length !== 9) return null;
  const num = parseInt(digits);
  return isNaN(num) ? null : num;
}

function parseOwnership(value: string): number | null {
  if (!value) return null;
  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

function cleanPhoneNumber(phone: string, countryCode?: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9+ -]/g, '').trim();
  if (cleaned.length < 7) return null;

  if (countryCode && countryCode.trim()) {
    return `${countryCode.trim()} ${cleaned}`;
  }
  return cleaned;
}

function cleanWebsiteUrl(website: string | undefined): string | null {
  if (!website || !website.trim()) return null;

  let url = website.trim().toLowerCase();

  if (url === 'n/a' || url === 'na' || url === 'none' || url === '-') {
    return null;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('.')) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function formatCurrencyDisplay(value: string | undefined | null): string {
  if (!value) return 'N/A';
  const num = parseInt(value.replace(/[^0-9]/g, ''));
  return isNaN(num) || num === 0 ? 'N/A' : `$${num.toLocaleString()}`;
}

export function validateZohoLeadData(leadData: ZohoLeadData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!leadData.First_Name || String(leadData.First_Name).trim() === '') {
    errors.push('First_Name is required');
  }
  if (!leadData.Last_Name || String(leadData.Last_Name).trim() === '') {
    errors.push('Last_Name is required');
  }
  if (!leadData.Email || String(leadData.Email).trim() === '') {
    errors.push('Email is required');
  }
  if (!leadData.Company || String(leadData.Company).trim() === '') {
    errors.push('Company is required');
  }

  const numericFields = ['Amount_Requested', 'Monthly_Revenue', 'Annual_Revenue', 'EIN', 'Owner1_Ownership', 'Owner_2_Ownership'];
  for (const field of numericFields) {
    const value = leadData[field];
    if (value !== null && value !== undefined && typeof value === 'number' && isNaN(value)) {
      errors.push(`${field} has invalid numeric value`);
    }
  }

  if (leadData.Email && typeof leadData.Email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.Email)) {
      errors.push(`Invalid email format: ${leadData.Email}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function formatDateForZoho(dateStr: string): string | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  return date.toISOString().split('T')[0];
}

export function formatApplicationForZoho(applicationData: {
  fundingSpecialistName?: string;
  amountRequested: string;
  useOfFunds: string;
  legalBusinessName: string;
  dba?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessPhoneCountry?: string;
  businessStartDate?: string;
  legalStructure?: string;
  stateOfIncorporation?: string;
  federalTaxId?: string;
  industry?: string;
  website?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerTitle?: string;
  ownershipPercentage?: string;
  ownerHomeAddress?: string;
  ownerSSN?: string;
  ownerDOB?: string;
  ownerPhone: string;
  ownerPhoneCountry?: string;
  ownerEmail: string;
  ownerDriversLicense?: string;
  ownerDriversLicenseState?: string;
  hasSecondOwner?: 'yes' | 'no' | '';
  secondOwnerFirstName?: string;
  secondOwnerLastName?: string;
  secondOwnerTitle?: string;
  secondOwnerOwnershipPercentage?: string;
  secondOwnerHomeAddress?: string;
  secondOwnerSSN?: string;
  secondOwnerDOB?: string;
  secondOwnerPhone?: string;
  secondOwnerPhoneCountry?: string;
  secondOwnerEmail?: string;
  secondOwnerDriversLicense?: string;
  secondOwnerDriversLicenseState?: string;
  grossAnnualSales?: string;
  averageMonthlyRevenue?: string;
  openLoansAdvances?: string;
  hasBankruptcy?: 'yes' | 'no' | '';
  properties?: Array<{
    address: string;
    propertyType: string;
    yearAcquired: string;
    purchasePrice: string;
    currentValue: string;
    loanBalance: string;
    lender: string;
    titleHolders: string;
  }>;
}): ZohoLeadData {
  const businessAddr = parseAddress(applicationData.businessAddress || '');
  const ownerAddr = parseAddress(applicationData.ownerHomeAddress || '');
  const secondOwnerAddr = parseAddress(applicationData.secondOwnerHomeAddress || '');

  const ownerPhone = cleanPhoneNumber(applicationData.ownerPhone, applicationData.ownerPhoneCountry);
  const businessPhone = cleanPhoneNumber(applicationData.businessPhone || '', applicationData.businessPhoneCountry);
  const secondOwnerPhone = cleanPhoneNumber(applicationData.secondOwnerPhone || '', applicationData.secondOwnerPhoneCountry);

  const firstName = applicationData.ownerFirstName?.trim() || '';
  const lastName = applicationData.ownerLastName?.trim() || '';
  const email = applicationData.ownerEmail?.trim() || '';
  const company = applicationData.legalBusinessName?.trim() || '';

  const leadData: ZohoLeadData = {
    First_Name: firstName || null,
    Last_Name: lastName || null,
    Email: email || null,
    Phone: ownerPhone,
    Company: company || null,
    Website: cleanWebsiteUrl(applicationData.website),
    Industry: applicationData.industry || null,
    Lead_Source: 'Prudential Capital Website - Funding Application',
    Designation: applicationData.ownerTitle?.trim() || null,

    Street: businessAddr.street || applicationData.businessAddress || null,
    City: businessAddr.city || null,
    State: businessAddr.state || applicationData.stateOfIncorporation || null,
    Zip_Code: businessAddr.zip || null,

    Amount_Requested: parseCurrency(applicationData.amountRequested),
    Monthly_Revenue: parseCurrency(applicationData.averageMonthlyRevenue || ''),
    Annual_Revenue: parseCurrency(applicationData.grossAnnualSales || ''),
    Use_For_Funding: applicationData.useOfFunds || null,

    DBA: applicationData.dba?.trim() || null,
    EIN: parseEIN(applicationData.federalTaxId || ''),
    Date_business_opened: formatDateForZoho(applicationData.businessStartDate || ''),
    Legal_Structure: applicationData.legalStructure || null,
    Phone_2: businessPhone,

    Owner_1_Street: ownerAddr.street || applicationData.ownerHomeAddress || null,
    Owner_1_City: ownerAddr.city || null,
    Owner_1_State: ownerAddr.state || null,
    Owner_1_Zip: ownerAddr.zip || null,
    Owner_1_Phone: ownerPhone,
    Owner_1_Email: email || null,
    Owner_1_SSN: applicationData.ownerSSN || null,
    Owner_1_Date_of_Birth: formatDateForZoho(applicationData.ownerDOB || ''),
    Owner_1_Drivers_License_Number: applicationData.ownerDriversLicense || null,
    Owner_1_DL_State_Issuance: applicationData.ownerDriversLicenseState || null,
    Owner1_Ownership: parseOwnership(applicationData.ownershipPercentage || ''),

    Additional_owners: applicationData.hasSecondOwner === 'yes' ? 'Yes' : 'No',
    Owner_2_First_Name: applicationData.secondOwnerFirstName?.trim() || null,
    Owner_2_Last_Name: applicationData.secondOwnerLastName?.trim() || null,
    Owner_2_Street: secondOwnerAddr.street || applicationData.secondOwnerHomeAddress || null,
    Owner_2_City: secondOwnerAddr.city || null,
    Owner_2_State: secondOwnerAddr.state || null,
    Owner_2_Zip: secondOwnerAddr.zip || null,
    Owner_2_Phone: secondOwnerPhone,
    Owner_2_Email: applicationData.secondOwnerEmail?.trim() || null,
    Owner_2_SSN: applicationData.secondOwnerSSN || null,
    Owner_2_Date_of_Birth: formatDateForZoho(applicationData.secondOwnerDOB || ''),
    Owner_2_Ownership: parseOwnership(applicationData.secondOwnerOwnershipPercentage || ''),

    Have_any_open_loans_advances: applicationData.openLoansAdvances && applicationData.openLoansAdvances.trim() !== '' && applicationData.openLoansAdvances !== '0' ? 'Yes' : 'No',
    Any_Liens_defaults_bankruptcy: applicationData.hasBankruptcy === 'yes' ? 'Yes' :
                                    applicationData.hasBankruptcy === 'no' ? 'No' : null,

    Description: [
      `Funding Specialist: ${applicationData.fundingSpecialistName || 'N/A'}`,
      `Amount Requested: ${formatCurrencyDisplay(applicationData.amountRequested)}`,
      `Use of Funds: ${applicationData.useOfFunds || 'N/A'}`,
      `Monthly Revenue: ${formatCurrencyDisplay(applicationData.averageMonthlyRevenue)}`,
      `Gross Annual Sales: ${formatCurrencyDisplay(applicationData.grossAnnualSales)}`,
      `Open Loans/Advances: ${applicationData.openLoansAdvances ? formatCurrencyDisplay(applicationData.openLoansAdvances) : 'None'}`,
      '',
      ...(applicationData.properties && applicationData.properties.length > 0
        ? [
            '--- PROPERTIES ---',
            ...applicationData.properties.map((prop, index) => [
              `Property ${index + 1}:`,
              `  Address: ${prop.address || 'N/A'}`,
              `  Type: ${prop.propertyType || 'N/A'}`,
              `  Year Acquired: ${prop.yearAcquired || 'N/A'}`,
              `  Purchase Price: ${formatCurrencyDisplay(prop.purchasePrice)}`,
              `  Current Value: ${formatCurrencyDisplay(prop.currentValue)}`,
              `  Loan Balance: ${formatCurrencyDisplay(prop.loanBalance)}`,
              `  Lender: ${prop.lender || 'N/A'}`,
              `  Title Holders: ${prop.titleHolders || 'N/A'}`,
            ].join('\n')),
          ]
        : []),
    ].filter(Boolean).join('\n'),
  };

  Object.keys(leadData).forEach(key => {
    if (leadData[key] === null || leadData[key] === undefined || leadData[key] === '') {
      delete leadData[key];
    }
  });

  return leadData;
}
