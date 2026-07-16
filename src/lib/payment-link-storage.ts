import { getFirestoreInstance, COLLECTIONS } from './firestore';

export interface PaymentLinkMeta {
  companySlug?: string | null;
  baseAmountWei?: string;
  feeAmountWei?: string;
  feePercentage?: number;
  createdAt: string;
}

export async function savePaymentLinkMeta(
  linkId: string,
  meta: Partial<Omit<PaymentLinkMeta, 'createdAt'>> & { createdAt?: string }
): Promise<void> {
  const db = getFirestoreInstance();
  await db.collection(COLLECTIONS.PAYMENT_LINK_BREAKDOWN).doc(linkId).set(
    {
      ...meta,
      createdAt: meta.createdAt ?? new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function getPaymentLinkIdsForCompany(slug: string): Promise<string[]> {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db
      .collection(COLLECTIONS.PAYMENT_LINK_BREAKDOWN)
      .where('companySlug', '==', slug)
      .get();

    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error('Error fetching payment link ids for company:', error);
    return [];
  }
}

export async function getCompanySlugForPaymentLink(linkId: string): Promise<string | undefined> {
  try {
    const db = getFirestoreInstance();
    const doc = await db.collection(COLLECTIONS.PAYMENT_LINK_BREAKDOWN).doc(linkId).get();
    if (!doc.exists) return undefined;
    const data = doc.data() as PaymentLinkMeta | undefined;
    return data?.companySlug ?? undefined;
  } catch (error) {
    console.error('Error fetching company slug for payment link:', error);
    return undefined;
  }
}
