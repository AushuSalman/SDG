import type { GlobalConfig } from 'payload'

import { canEditContent } from '@/lib/access'

/**
 * The paragraphs on the Home, About, Leadership, Careers and business pages, so marketing can reword them
 * without a release. The defaults are the text published on sdg.in (migrated 21 Oct 2026); paragraphs are
 * separated by a blank line, list fields take one item per line.
 */
export const COPY = {
  homeIntro: `We are, with our four distinct business interests, a conglomerate that focuses on generating value for the people with us, and the community at large. We are Suvarna Durga Group, a leading group which for over four decades has been working to improve the quality of life and deliver tangible value. We have an uncanny ability to see opportunity where most others overlook, and we turn things around for good, with our diligence and mastery. And that is how we move from strength to strength, never ceasing.

We have generated profits from recycling waste on one hand and, on the other, made grassroots-level connections with farmers for quality produce. Today we are raising one of the tallest buildings in Hyderabad, at the Financial District and the Golden Mile, promising a futuristic lifestyle; before that, we built VSD Tech Park. We grow at a spectacular rate, with all of our business interests posting consistently increasing growth.`,
  promise: 'A leader in all that we do, and a brand whose promise is as good as gold.',
  aboutIntro: 'Starting from 1978, when the very seeds were sown by Sri Jakkireddy Subbareddy, we have grown from strength to strength, from incubation to growth, to stand where we are now. As a leader in all that we do, and as a brand whose promise is as good as gold.',
  origins: 'We started with trading in waste paper, and then recycled bottles. Learning from trading waste paper, we then set up a manufacturing unit. And that is how we move from strength to strength, never ceasing. Our efforts are constant, as we strive on the path to excellence, looking for better opportunities.',
  philosophy: 'The essence of all that we do stems from our founding philosophy. To walk steady on the path laid out by our visionary founding father, we commit ourselves to:',
  values: [
    { title: 'Integrity, honesty and transparency' },
    { title: 'Keeping people at the centre of things' },
    { title: 'Inclusive and responsible growth' },
    { title: 'Delivering value' },
  ],
  legacyTitle: 'A founding father and a great visionary',
  legacyBody: `From a remote village, Vinukonda, Sri Jakkireddy Subbareddy, a farmer's son, set his sights on greater things. His humble beginnings did not stop him from dreaming big or doing what it takes to achieve it.

With his ability to see an opportunity when it presented itself, and with the willingness to take on the toil needed to turn things around for good, Jakkireddy Garu started trading in waste paper. Committed to quality and to his promise, with diligence and integrity he was soon able to create value in every venture.

A man with the proverbial Midas touch, Jakkireddy Garu, the great visionary, worked for the community and the people who shared his vision, taking them along on a trajectory of success that only grew upwards. What he did changed things around for everybody's good, and it is his philosophy that laid the foundation of the Suvarna Durga Group.`,
  successBody: `We have a history of posting success in every venture of ours. When we enter a domain, we master it, post our success and then consolidate it. It is in this way that we have secured success in the waste management businesses, becoming one of the largest companies in the segment.

As a brand that always looks for new opportunities to create tangible value, progressively increasing profits, we move on to newer areas after consolidating our positions. It is our mantra to be continuously relevant, continuously at the cutting edge of business.

Today we consolidate our position in the realty domain, and in the future we will continue to tap into what comes next. Our stakeholders can be assured that with SDG they will also be at the cutting edge of what the future holds.`,
  b2bBody: 'For over 25 years, we have been serving the needs of our B2B buyers, and they see us as preferred business partners: partners in success whom they can trust to deliver as promised. We commit to the highest quality standards and absolute transparency, and ensure everything we do is ethical.',
  csrBody: `Suvarna Durga Group has been giving back to society from the day of its inception. Founder Chairman Sri Jakkireddy Subba Reddy, acknowledging his inability to get a formal education due to adverse economic circumstances, has always come forward to empower young talent to pursue their dreams and aspirations. To this end, the company awards 20 deserving candidates a scholarship of ₹20,000 each to help them complete their undergraduate studies, under the Suvarna Durga Group Trust set up in 2016.

The Trust has also refurbished a Zilla Parishad High School in LB Nagar, where a new 3,000 sq ft facility was built on the first floor to give its students better facilities. By the very nature of its work and dealings, the company has generated thousands of individual entrepreneurs by providing indirect employment.`,
  careersIntro: 'We are committed to growth and our vision is a grand one. Join us in our pursuit of excellence for greater good.',
  constructionIntro: 'Multiple high-end commercial and residential projects in prime locales of Hyderabad. Over a decade of experience in innovative and futuristic residential and commercial spaces.',
  paperIntro: 'Machine-finished kraft paper for the packaging industry throughout Telangana and Andhra Pradesh. Strong capabilities, backed by a reliable supply chain, produce paper from 18 to 28 BF and 100 to 250 GSM. One of the leading suppliers to corrugated box manufacturers, Suvarna Durga Paper went from 20 TPD to 600 TPD in a very short period to capture a significant portion of the market.',
  glassIntro: 'Recycling empty bottles through a robust and strategically located network of warehouses spread across two states. Exclusive contracts with all of its customers give a steady flow of bottles and revenues. Innovative and with a strong financial background, Suvarna Durga Bottles Pvt. Ltd. is a leading player in the Telangana and Andhra Pradesh market.',
  glassWarehouses: 'Each dedicated warehouse has the capacity to handle more than 3 million bottles a month. Suvarna Durga Group owns and operates 32 transportation vehicles to ensure the smooth supply of its products to its customers.',
  glassPilot: 'As a pilot project, Suvarna Durga Bottles has moved to automated washing and cleaning of bottles to test quality, durability and operational efficiency. In future it plans to automate more plants to ensure the best quality of products is delivered to its customers.',
  agroIntro: 'A sustainable and synergistic business with a procurement network extending to grassroots level. Procurement, logistics and delivery of grains, rice and other agro products through a supply chain that sources from Andhra Pradesh, Telangana, Odisha and Chhattisgarh. Well-networked and with strong quality control, Suvarna Durga Agro Products Pvt. Ltd. stands for timely delivery across India. Agro products are procured at source, transported and quality-checked for the promised quality.',
  agroStrengths: `Suvarna Durga entered the business of agri products trading in 2017 to leverage its own core strengths of procurement and supply-chain management.

In a brief period Suvarna Durga spread its network across Andhra Pradesh, Telangana, Chhattisgarh, Maharashtra, Karnataka, Madhya Pradesh and Odisha. In these areas it fully utilises its expertise in procurement, quality control, logistics and the timely delivery of superior-quality rejection rice, broken rice, maize and DDGS at attractive, competitive prices.

The company began as a more than viable business, has a healthy rate of growth and promises to be a serious player in this vertical. Suvarna Durga has high credibility and loyalty for the benefits that accrue to farmer, seller and customer alike.`,
  agroSellers: `Better selling price for the farmer
Negligible middleman dealings
Acknowledged expertise in supply-chain management
Avoiding the mistakes of other bulk buyers`,
  agroBuyers: `Delivery of superior quality
Consistent, timely delivery
Attractive pricing
Just-in-time supply management, so no capital is locked up`,
  agroWhy: `Expertise in supply-chain management
Strong fundamentals
Warehouses and transportation
Reliable partners
Strong financials
On-time delivery
Better value for farmers
No middlemen
Optimum pricing
Superior-quality products`,
}

const para = (name: string, label: string, description: string, rows = 4) => ({
  name,
  type: 'textarea' as const,
  label,
  defaultValue: COPY[name as keyof typeof COPY] as string,
  admin: { description, rows },
})

export const SiteCopy: GlobalConfig = {
  slug: 'site-copy',
  label: 'Website copy',
  admin: { group: 'Website', description: 'The paragraphs on the Home, About, Leadership, Careers and business pages. Leave a blank line between paragraphs.' },
  access: { read: () => true, update: canEditContent },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Home & footer',
          fields: [
            para('homeIntro', 'Home introduction', 'The "About the Group" paragraphs on the home page', 8),
            { name: 'promise', type: 'text', label: 'Brand promise', defaultValue: COPY.promise, admin: { description: 'One line under the logo in the footer' } },
            para('b2bBody', 'Partners line', 'Shown on the home page above the testimonials and on the Partnerships page', 3),
          ],
        },
        {
          label: 'About & legacy',
          fields: [
            para('aboutIntro', 'About introduction', 'The opening paragraph of the About page', 3),
            para('origins', 'How it started', 'Shown beside the first-factory photograph above the timeline', 3),
            { name: 'philosophy', type: 'text', label: 'Values introduction', defaultValue: COPY.philosophy, admin: { description: 'The sentence that introduces the four values' } },
            {
              name: 'values',
              type: 'array',
              label: 'Values',
              defaultValue: COPY.values,
              admin: { description: 'The founding values, in order' },
              fields: [{ type: 'row', fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'text', admin: { description: 'Optional one-line explanation' } },
              ] }],
            },
            { name: 'legacyTitle', type: 'text', label: 'Legacy heading', defaultValue: COPY.legacyTitle },
            para('legacyBody', 'Legacy', 'The founder\'s story', 8),
            { name: 'legacyPhoto', type: 'upload', relationTo: 'media', label: 'Founder photograph' },
            para('csrBody', 'Corporate social responsibility', 'Shown in the CSR section of the About page, above any approved CSR facts', 6),
            { name: 'officeGallery', type: 'upload', relationTo: 'media', hasMany: true, label: 'Corporate office gallery', admin: { description: 'Photographs of the corporate office, shown at the foot of the About page' } },
            { name: 'csrGallery', type: 'upload', relationTo: 'media', hasMany: true, label: 'CSR gallery' },
          ],
        },
        {
          label: 'Leadership & careers',
          fields: [
            para('successBody', 'Leadership introduction', 'The paragraphs above the profiles on the Leadership page', 8),
            para('careersIntro', 'Careers introduction', 'The opening line of the Careers page', 2),
          ],
        },
        {
          label: 'Businesses',
          fields: [
            para('constructionIntro', 'Construction', 'Under the headline on the Construction page', 3),
            para('paperIntro', 'Paper', 'Under the headline on the Paper page', 4),
            { name: 'paperGallery', type: 'upload', relationTo: 'media', hasMany: true, label: 'Paper plant & equipment gallery' },
            para('glassIntro', 'Glass bottles', 'Under the headline on the Glass Recycling page', 4),
            para('glassWarehouses', 'Warehouse network', 'Beside the warehouse map', 3),
            { name: 'warehouseMap', type: 'upload', relationTo: 'media', label: 'Warehouse map' },
            para('glassPilot', 'Automated plant', 'The pilot-project paragraph on the Glass Recycling page', 3),
            { name: 'glassGallery', type: 'upload', relationTo: 'media', hasMany: true, label: 'Automated plant gallery' },
            para('agroIntro', 'Agro products', 'Under the headline on the Agro Products page', 4),
            para('agroStrengths', 'Leveraging our strengths', 'The three paragraphs on the Agro Products page', 7),
            para('agroSellers', 'Benefits for sellers', 'One per line', 4),
            para('agroBuyers', 'Benefits for buyers', 'One per line', 4),
            para('agroWhy', 'Why us', 'One per line', 6),
          ],
        },
      ],
    },
  ],
}
