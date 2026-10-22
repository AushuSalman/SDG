/** What the website knows about an enquiry when it hands it to a CRM; each adapter maps it to its own shape. */
export type CrmLead = {
  name?: string | null
  mobile: string
  email?: string | null
  project?: string | null
  enquiryType: string
  purpose?: string | null
  budgetBand?: string | null
  timeline?: string | null
  source: string
  utm?: Record<string, string | null | undefined>
  message?: string | null
  score?: number | null
  band?: string | null
  websiteEnquiryId: string
}

export type CrmResult = { id: string; contactId?: string }
