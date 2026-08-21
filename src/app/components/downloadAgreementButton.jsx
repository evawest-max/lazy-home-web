import { Button } from "@chakra-ui/react";
import { useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { downloadTenancyDoc } from "../../../api";

pdfMake.vfs = pdfFonts.vfs;  // ✅ correct


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
