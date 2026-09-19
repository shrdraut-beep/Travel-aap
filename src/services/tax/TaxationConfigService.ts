/**
 * Government Statutory Taxation & Dynamic Platform Commission Service
 * Compliant with Indian GST Law, CBIC Notifications & Section 9(5) CGST Act.
 */

export type ServiceVertical = 'PACKAGE' | 'HOTEL' | 'CAB' | 'BUS';

export interface VerticalTaxRule {
  vertical: ServiceVertical;
  name: string;
  nameMr: string;
  sacCode: string;
  platformCommissionPercent: number; // e.g. 10.0%
  serviceGstPercent: number;          // e.g. 5.0% for Tour/Cab/Bus, 12.0% for Hotel <= 7500
  luxuryHotelGstPercent?: number;     // 18.0% for Hotel > 7500
  gstOnCommissionPercent: number;     // 18.0% standard GST on platform facilitation
  tcsPercent: number;                 // 1.0% under Section 52 of CGST Act (ECO)
  tdsPercent: number;                 // 1.0% under Section 194-O of IT Act
  description: string;
  descriptionMr: string;
}

export interface TaxationConfig {
  lastUpdated: string;
  updatedBy: string;
  rules: Record<ServiceVertical, VerticalTaxRule>;
}

export type GstSupplyType = 'INTRA_STATE' | 'INTER_STATE';

export interface TaxCalculationBreakdown {
  vendorNetPrice: number;
  platformCommissionPercent: number;
  platformCommissionAmount: number;
  serviceGstPercent: number;
  serviceGstAmount: number;
  gstOnCommissionPercent: number;
  gstOnCommissionAmount: number;
  tcsPercent: number;
  tcsAmount: number;
  totalTaxAndCommission: number;
  finalUserPrice: number;
  effectiveMarkupPercent: number;
  sacCode: string;
  isLuxuryHotelTier?: boolean;

  // Explicit Statutory GST Split (CGST + SGST vs IGST)
  supplyType: GstSupplyType;
  // Inter-State (Different State) IGST
  igstPercent: number;
  igstAmount: number;
  commissionIgstAmount: number;
  totalIgst: number;

  // Intra-State (Same State) CGST + SGST
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  commissionCgstAmount: number;
  commissionSgstAmount: number;
  totalCgst: number;
  totalSgst: number;
}

const STORAGE_KEY = 'routripo_admin_tax_config_v1';
const TAX_UPDATE_EVENT = 'routripo_tax_config_updated';

/**
 * Official Indian Government Statutory Defaults per GST Council Notifications
 */
export const STATUTORY_GOVT_DEFAULTS: Record<ServiceVertical, VerticalTaxRule> = {
  PACKAGE: {
    vertical: 'PACKAGE',
    name: 'Tour & Holiday Packages',
    nameMr: 'टूर व हॉलिडे पॅकेजेस',
    sacCode: '998555',
    platformCommissionPercent: 10.0,
    serviceGstPercent: 5.0, // Composite tour operator rate without ITC
    gstOnCommissionPercent: 18.0,
    tcsPercent: 1.0,
    tdsPercent: 1.0,
    description: 'Tour operator service without ITC (5% GST per Notification 11/2017-CT(R))',
    descriptionMr: 'टूर ऑपरेटर सेवा (ITC शिवाय ५% GST, केंद्र सरकार अधिसूचना क्र. ११/२०१७)'
  },
  HOTEL: {
    vertical: 'HOTEL',
    name: 'Hotel & Resort Stays',
    nameMr: 'हॉटेल व रिसॉर्ट मुक्काम',
    sacCode: '996311',
    platformCommissionPercent: 8.5,
    serviceGstPercent: 12.0, // Room tariff <= 7,500
    luxuryHotelGstPercent: 18.0, // Room tariff > 7,500
    gstOnCommissionPercent: 18.0,
    tcsPercent: 1.0,
    tdsPercent: 1.0,
    description: '12% GST for room tariffs up to ₹7,500/night; 18% GST above ₹7,500/night',
    descriptionMr: 'दररोज ₹७,५०० पर्यंतच्या खोल्यांवर १२% GST; ₹७,५०० वरील खोल्यांवर १८% GST'
  },
  CAB: {
    vertical: 'CAB',
    name: 'Intercity & Local Cabs',
    nameMr: 'आऊटस्टेशन व लोकल कॅब्स',
    sacCode: '996412',
    platformCommissionPercent: 5.0,
    serviceGstPercent: 5.0, // Passenger transport via ECO under Sec 9(5)
    gstOnCommissionPercent: 18.0,
    tcsPercent: 1.0,
    tdsPercent: 1.0,
    description: 'Passenger road transport by taxi/cab via ECO (5% GST under Sec 9(5) CGST Act)',
    descriptionMr: 'ई-कॉमर्स प्लॅटफॉर्मद्वारे टॅक्सी/कॅब प्रवासी वाहतूक (५% GST, कलम ९(५))'
  },
  BUS: {
    vertical: 'BUS',
    name: 'Intercity Bus Ticketing',
    nameMr: 'आंतरशहरी बस तिकिटे',
    sacCode: '996411',
    platformCommissionPercent: 5.0,
    serviceGstPercent: 5.0, // AC stage carriage/omnibus via ECO
    gstOnCommissionPercent: 18.0,
    tcsPercent: 1.0,
    tdsPercent: 1.0,
    description: 'Passenger transport by bus/omnibus via ECO (5% GST under Sec 9(5) CGST Act)',
    descriptionMr: 'ई-कॉमर्स प्लॅटफॉर्मद्वारे बस वाहतूक (५% GST, अधिसूचना क्र. १७/२०२१)'
  }
};

class TaxationConfigService {
  private config: TaxationConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): TaxationConfig {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.rules && parsed.rules.PACKAGE) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to parse stored taxation config:', err);
      }
    }
    return {
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Government Gazette / Admin Defaults',
      rules: { ...STATUTORY_GOVT_DEFAULTS }
    };
  }

  public getConfig(): TaxationConfig {
    return this.config;
  }

  public getVerticalRule(vertical: ServiceVertical): VerticalTaxRule {
    return this.config.rules[vertical] || STATUTORY_GOVT_DEFAULTS[vertical];
  }

  /**
   * Save new taxation & commission rules and broadcast to all subscriber forms
   */
  public updateConfig(newRules: Record<ServiceVertical, VerticalTaxRule>, updatedBy: string = 'Admin'): void {
    this.config = {
      lastUpdated: new Date().toISOString(),
      updatedBy,
      rules: { ...newRules }
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
        window.dispatchEvent(new CustomEvent(TAX_UPDATE_EVENT, { detail: this.config }));
      } catch (err) {
        console.error('Failed to persist taxation config:', err);
      }
    }
  }

  /**
   * Restore official statutory Government GST slabs and defaults
   */
  public resetToDefaults(): void {
    this.updateConfig(STATUTORY_GOVT_DEFAULTS, 'System Reset to Statutory Defaults');
  }

  /**
   * Subscribe to live tax config updates from Admin Panel
   */
  public subscribe(callback: (config: TaxationConfig) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<TaxationConfig>;
      callback(customEvent.detail || this.config);
    };
    window.addEventListener(TAX_UPDATE_EVENT, handler);
    return () => window.removeEventListener(TAX_UPDATE_EVENT, handler);
  }

  /**
   * Core Calculation: Computes customer selling price from vendor net price
   */
  public calculateUserPrice(vendorNetPrice: number, vertical: ServiceVertical, supplyType: GstSupplyType = 'INTRA_STATE'): TaxCalculationBreakdown {
    const net = Math.max(0, Number(vendorNetPrice) || 0);
    const rule = this.getVerticalRule(vertical);

    if (net <= 0) {
      const halfRate = Number((rule.serviceGstPercent / 2).toFixed(2));
      return {
        vendorNetPrice: 0,
        platformCommissionPercent: rule.platformCommissionPercent,
        platformCommissionAmount: 0,
        serviceGstPercent: rule.serviceGstPercent,
        serviceGstAmount: 0,
        gstOnCommissionPercent: rule.gstOnCommissionPercent,
        gstOnCommissionAmount: 0,
        tcsPercent: rule.tcsPercent,
        tcsAmount: 0,
        totalTaxAndCommission: 0,
        finalUserPrice: 0,
        effectiveMarkupPercent: 0,
        sacCode: rule.sacCode,
        isLuxuryHotelTier: false,
        supplyType,
        igstPercent: rule.serviceGstPercent,
        igstAmount: 0,
        commissionIgstAmount: 0,
        totalIgst: 0,
        cgstPercent: halfRate,
        cgstAmount: 0,
        sgstPercent: halfRate,
        sgstAmount: 0,
        commissionCgstAmount: 0,
        commissionSgstAmount: 0,
        totalCgst: 0,
        totalSgst: 0
      };
    }

    // 1. Platform Commission
    const commPercent = rule.platformCommissionPercent;
    const commissionAmount = Math.round((net * commPercent) / 100);

    // 2. GST on Platform Commission (18% standard facilitation SAC 9983)
    const gstOnCommPercent = rule.gstOnCommissionPercent || 18.0;
    const gstOnCommissionAmount = Math.round((commissionAmount * gstOnCommPercent) / 100);

    // 3. Service GST (5% for Tour/Cab/Bus, or 12%/18% for Hotel based on tariff)
    let serviceGstPercent = rule.serviceGstPercent;
    let isLuxury = false;

    if (vertical === 'HOTEL') {
      const estimatedPreTax = net + commissionAmount;
      if (estimatedPreTax > 7500 && rule.luxuryHotelGstPercent) {
        serviceGstPercent = rule.luxuryHotelGstPercent;
        isLuxury = true;
      }
    }

    // Tax base for Service GST = (Vendor Net + Commission)
    const serviceTaxBase = net + commissionAmount;
    const serviceGstAmount = Math.round((serviceTaxBase * serviceGstPercent) / 100);

    // 4. TCS under GST (Section 52 - 1%)
    const tcsPercent = rule.tcsPercent || 1.0;
    const tcsAmount = Math.round((net * tcsPercent) / 100);

    // 5. Total Customer Selling Price (User Price)
    const finalUserPrice = net + commissionAmount + gstOnCommissionAmount + serviceGstAmount;
    const totalTaxAndCommission = finalUserPrice - net;
    const effectiveMarkupPercent = net > 0 ? Number(((totalTaxAndCommission / net) * 100).toFixed(1)) : 0;

    // 6. Detailed IGST (Inter-State) vs CGST + SGST (Intra-State) Tax Breakdown
    // Inter-State Supply: Entire GST is IGST (Integrated Goods and Services Tax)
    const igstPercent = serviceGstPercent;
    const igstAmount = serviceGstAmount;
    const commissionIgstAmount = gstOnCommissionAmount;
    const totalIgst = serviceGstAmount + gstOnCommissionAmount;

    // Intra-State Supply: GST is split 50:50 into CGST (Central) and SGST (State)
    const cgstPercent = Number((serviceGstPercent / 2).toFixed(2));
    const sgstPercent = Number((serviceGstPercent / 2).toFixed(2));
    const cgstAmount = Math.round(serviceGstAmount / 2);
    const sgstAmount = serviceGstAmount - cgstAmount;
    const commissionCgstAmount = Math.round(gstOnCommissionAmount / 2);
    const commissionSgstAmount = gstOnCommissionAmount - commissionCgstAmount;
    const totalCgst = cgstAmount + commissionCgstAmount;
    const totalSgst = sgstAmount + commissionSgstAmount;

    return {
      vendorNetPrice: net,
      platformCommissionPercent: commPercent,
      platformCommissionAmount: commissionAmount,
      serviceGstPercent,
      serviceGstAmount,
      gstOnCommissionPercent: gstOnCommPercent,
      gstOnCommissionAmount,
      tcsPercent,
      tcsAmount,
      totalTaxAndCommission,
      finalUserPrice,
      effectiveMarkupPercent,
      sacCode: rule.sacCode,
      isLuxuryHotelTier: isLuxury,
      supplyType,
      igstPercent,
      igstAmount,
      commissionIgstAmount,
      totalIgst,
      cgstPercent,
      cgstAmount,
      sgstPercent,
      sgstAmount,
      commissionCgstAmount,
      commissionSgstAmount,
      totalCgst,
      totalSgst
    };
  }

  /**
   * Reverse calculation: Computes vendor net price from customer selling price
   */
  public calculateVendorNet(finalUserPrice: number, vertical: ServiceVertical): number {
    const total = Math.max(0, Number(finalUserPrice) || 0);
    if (total <= 0) return 0;
    const rule = this.getVerticalRule(vertical);
    const commRate = rule.platformCommissionPercent / 100;
    const gstOnCommRate = (rule.gstOnCommissionPercent || 18) / 100;
    const serviceGstRate = rule.serviceGstPercent / 100;

    // finalUserPrice = net * (1 + commRate + (commRate * gstOnCommRate) + (1 + commRate) * serviceGstRate)
    const multiplier = 1 + commRate + (commRate * gstOnCommRate) + ((1 + commRate) * serviceGstRate);
    return Math.round(total / multiplier);
  }
}

export const taxationConfigService = new TaxationConfigService();
