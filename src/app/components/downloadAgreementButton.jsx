import { Button } from "@chakra-ui/react";
import { useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { downloadTenancyDoc } from "../../../api";

pdfMake.vfs = pdfFonts.vfs;  // ✅ correct

// FIX 3: Add your logo base64 - you can't use string name without defining it
const safeTenantLogoBase64 = "data:image/png;base64,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";
// convert your logo at https://base64.guru/converter/encode/image


export default function DownloadAgreementButton({ escrowid }) {
    const [downloading, setDownloading] = useState(false);

    async function downloadSafeTenantAgreement(id) {
        setDownloading(true);
        try {
            const response = await downloadTenancyDoc(id); // make sure this API helper is imported
            const data = response.data.data;

            const docDefinition = {
                // Document Settings
                pageSize: 'LETTER',
                pageMargins: [54, 54, 54, 54], // Professional 0.75-inch margins

                content: [
                    {
                        columns: [
                            {
                                image: safeTenantLogoBase64, // base64 string of your logo
                                width: 120,
                                alignment: 'left',
                                margin: [0, 0, 0, 10]
                            },
                            {
                                text: [
                                    { text: `Agreement ID: ${data.agreementId || id}\n`, bold: true },
                                    { text: `Generated: ${new Date().toLocaleDateString()}`, italics: true }
                                ],
                                style: 'metaText',
                                alignment: 'right',
                                margin: [0, 0, 0, 10]
                            }
                        ]
                    },

                    { text: 'RESIDENTIAL TENANCY AGREEMENT', style: 'docTitle' },
                    { text: 'This legally binding document is securely managed and recorded via SafeTenant.', style: 'tagline' },

                    { text: '1. PARTIES & PROPERTY', style: 'sectionHeader' },
                    {
                        text: [
                            'This Residential Tenancy Agreement ("Agreement") is entered into and made effective as of ',
                            { text: data.startDate, bold: true },
                            ', by and between the following parties:\n',
                            '• Landlord: ', { text: data.landlordName, bold: true }, '\n',
                            '• Tenant: ', { text: data.tenantName, bold: true }, '\n',
                            'The Landlord agrees to lease to the Tenant, and the Tenant agrees to lease from the Landlord, the residential premises located at:\n',
                            'Premises Address: ', { text: `${data.propertyAddress.streetAddress}, ${data.propertyAddress.area}, ${data.propertyAddress.state}`, bold: true }
                        ],
                        style: 'bodyText'
                    },

                    { text: '2. TERM & OCCUPANCY', style: 'sectionHeader' },
                    {
                        text: [
                            'The initial term of this lease shall commence on ',
                            { text: data.startDate, bold: true },
                            ' and terminate on ',
                            { text: data.endDate, bold: true },
                            '. Upon expiration, this Agreement may switch to a month-to-month tenancy or be renewed upon mutual written agreement of both parties.'
                        ],
                        style: 'bodyText'
                    },

                    { text: '3. RENT PAYMENT & FEES', style: 'sectionHeader' },
                    {
                        text: [
                            'The Tenant agrees to pay a monthly rent amount of ₦',
                            { text: (data.payoutBreakdown?.rentAmount || 0).toLocaleString(), bold: true },
                            '. Rent payments are due in advance on or before the 1st day of each calendar month. Payments shall be delivered electronically through the SafeTenant platform or via methods expressly permitted by the Landlord.'
                        ],
                        style: 'bodyText'
                    },

                    { text: '4. SECURITY DEPOSIT', style: 'sectionHeader' },
                    {
                        text: [
                            'Upon execution of this Agreement, the Tenant shall deposit with the Landlord the sum of ₦',
                            { text: (data.payoutBreakdown?.cautionDeposit || 0).toLocaleString(), bold: true },
                            ' as security for any damage caused to the Premises during the term of the lease. This deposit will be returned, less any lawful deductions, within the statutory timeframe after the Tenant vacates.'
                        ],
                        style: 'bodyText'
                    },

                    { text: '5. SIGNATURES & EXECUTION', style: 'sectionHeader' },
                    {
                        text: 'IN WITNESS WHEREOF, the parties hereto have executed this Residential Tenancy Agreement on the dates indicated below. By signing digitally or physically, both parties acknowledge reading, understanding, and agreeing to all bound clauses.',
                        style: 'bodyText'
                    },

                    {
                        columns: [
                            {
                                stack: [
                                    { text: "_____________________________________", color: "#94A3B8" },
                                    { text: data.landlordName || "-", bold: true, margin: [0, 5, 0, 2] },
                                    { text: "Landlord Signature", color: "#64748B", fontSize: 9 },
                                ],
                            },
                            {
                                stack: [
                                    { text: "_____________________________________", color: "#94A3B8" },
                                    { text: data.tenantName || "-", bold: true, margin: [0, 5, 0, 2] },
                                    { text: "Tenant Signature", color: "#64748B", fontSize: 9 },
                                ],
                            },
                        ],
                    },
                ],


                // Professional Design Styles
                styles: {
                    docTitle: { fontSize: 22, bold: true, color: '#0F172A', alignment: 'center', letterSpacing: 0.5 },
                    tagline: { fontSize: 10, color: '#059669', alignment: 'center', margin: [0, 4, 0, 25], italic: true },
                    metaText: { fontSize: 9, color: '#64748B', lineHeight: 1.3 },
                    sectionHeader: { fontSize: 12, bold: true, color: '#0F172A', margin: [0, 15, 0, 10], letterSpacing: 0.5 },
                    bodyText: { fontSize: 10.5, color: '#334155', lineHeight: 1.5, margin: [0, 0, 0, 12] },
                    bodyEmbed: { color: '#0F172A', lineHeight: 2 }
                }
            };

            // Build and download the file
            pdfMake.createPdf(docDefinition).download(`SafeTenant_Lease_${data.tenantName}.pdf`);

        } catch (error) {
            console.error("Failed to compile Agreement PDF:", error);
        } finally {
            setDownloading(false);
        }
    }

    return (
        <Button size="sm" onClick={() => downloadSafeTenantAgreement(escrowid)} disabled={downloading}>
            {downloading ? "Generating..." : "Download Agreement"}
        </Button>
    );
}
