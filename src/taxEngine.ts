export interface BookingInfo {
    id: string;
    type: 'CAR' | 'HOTEL' | 'AGENT_PACKAGE_DOMESTIC' | 'OVERSEAS_TOUR' | 'BUNDLED_PACKAGE' | 'TRAIN_IRCTC';
    totalAmount: number;
    isUnregisteredVendor?: boolean;
    irctcServiceCharge?: number;
    vendorState?: string; // e.g., 'MH', 'KA'
    customerState?: string;
    appState?: string; // e.g., 'MH'
    vendorTotalTurnoverYearly?: number; // for 194-O
}

export function calculateRouTriOTaxes(booking: BookingInfo) {
    const { 
        type, 
        totalAmount, 
        isUnregisteredVendor = false, 
        irctcServiceCharge = 20,
        vendorState = 'MH',
        customerState = 'MH',
        appState = 'MH', // We assume app is registered in MH
        vendorTotalTurnoverYearly = 0
    } = booking;

    let result = {
        bookingType: type,
        customerPays: totalAmount,
        appCommission: 0,
        gstOnCommission: 0,
        taxesToHold: {
            tds_194O: 0,
            tcs_GST: 0,
            section95_GST: 0,
            tcs_Overseas_206C: 0,
            bundled_GST: 0
        },
        vendorPayout: 0,
        passThroughAmount: 0,
        invoiceDetails: {
            hsnSacCode: '',
            placeOfSupply: customerState,
            cgst: 0,
            sgst: 0,
            igst: 0
        }
    };

    // 194-O Threshold: Only applies if yearly turnover > 5,00,000 INR
    const TDS_THRESHOLD = 500000;
    const applyTDS = (vendorTotalTurnoverYearly + totalAmount) > TDS_THRESHOLD;
    const baseTDS = applyTDS ? totalAmount * 0.001 : 0; 

    // Helper to calculate split GST based on state
    const calculateGSTSplit = (amount: number, gstRate: number, fromState: string, toState: string) => {
        let cgst = 0, sgst = 0, igst = 0;
        if (fromState === toState) {
            cgst = (amount * gstRate) / 2;
            sgst = (amount * gstRate) / 2;
        } else {
            igst = amount * gstRate;
        }
        return { cgst, sgst, igst };
    };

    switch (type) {
        case 'CAR':
            result.invoiceDetails.hsnSacCode = '996412';
            result.appCommission = totalAmount * 0.03;
            result.gstOnCommission = result.appCommission * 0.18;
            result.taxesToHold.section95_GST = totalAmount * 0.05;
            result.taxesToHold.tds_194O = baseTDS;
            result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.section95_GST + result.taxesToHold.tds_194O);
            break;

        case 'HOTEL':
            result.invoiceDetails.hsnSacCode = '996311';
            result.appCommission = totalAmount * 0.05;
            result.gstOnCommission = result.appCommission * 0.18;
            result.taxesToHold.tds_194O = baseTDS;

            if (isUnregisteredVendor) {
                result.taxesToHold.section95_GST = totalAmount * 0.12;
                result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.section95_GST + result.taxesToHold.tds_194O);
            } else {
                result.taxesToHold.tcs_GST = totalAmount * 0.01;
                result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.tcs_GST + result.taxesToHold.tds_194O);
            }
            break;

        case 'AGENT_PACKAGE_DOMESTIC':
            result.invoiceDetails.hsnSacCode = '998552';
            result.appCommission = totalAmount * 0.10;
            result.gstOnCommission = result.appCommission * 0.18;
            result.taxesToHold.tcs_GST = totalAmount * 0.01;
            result.taxesToHold.tds_194O = baseTDS;
            result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.tcs_GST + result.taxesToHold.tds_194O);
            break;

        case 'OVERSEAS_TOUR':
            result.invoiceDetails.hsnSacCode = '998553';
            result.appCommission = totalAmount * 0.10;
            result.gstOnCommission = result.appCommission * 0.18;
            result.taxesToHold.tcs_Overseas_206C = totalAmount * 0.05; 
            result.customerPays = totalAmount + result.taxesToHold.tcs_Overseas_206C;
            result.taxesToHold.tcs_GST = totalAmount * 0.01;
            result.taxesToHold.tds_194O = baseTDS;
            result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.tcs_GST + result.taxesToHold.tds_194O);
            break;

        case 'BUNDLED_PACKAGE':
            result.invoiceDetails.hsnSacCode = '998555';
            result.taxesToHold.bundled_GST = totalAmount * 0.05;
            result.appCommission = totalAmount * 0.15;
            result.vendorPayout = totalAmount - (result.appCommission + result.taxesToHold.bundled_GST);
            break;

        case 'TRAIN_IRCTC':
            result.invoiceDetails.hsnSacCode = '996411';
            result.appCommission = irctcServiceCharge; 
            result.gstOnCommission = irctcServiceCharge * 0.18;
            result.passThroughAmount = totalAmount;
            result.customerPays = totalAmount + result.appCommission + result.gstOnCommission;
            break;

        default:
            throw new Error("Invalid Booking Type");
    }

    // Assign GST Split on the App's Commission (since App bills customer/vendor for commission)
    const gstSplit = calculateGSTSplit(result.appCommission, 0.18, appState, customerState);
    result.invoiceDetails.cgst = gstSplit.cgst;
    result.invoiceDetails.sgst = gstSplit.sgst;
    result.invoiceDetails.igst = gstSplit.igst;

    const totalTaxToHold = Object.values(result.taxesToHold).reduce((acc, val) => acc + val, 0);

    return {
        ...result,
        RAZORPAY_SPLIT: {
            customerCharge: result.customerPays.toFixed(2),
            appRevenue: (result.appCommission + result.gstOnCommission).toFixed(2),
            taxWalletHold: totalTaxToHold.toFixed(2),
            vendorWalletPayout: result.vendorPayout.toFixed(2),
            passThroughWallet: result.passThroughAmount.toFixed(2)
        }
    };
}
