import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './config';

// Collection reference
const donationsCollection = 'donations';
const donationStatsCollection = 'donationStats';

/**
 * Record a new donation
 * @param {Object} donationData - Donation information
 * @param {string} donationData.donorName - Name of the donor (optional)
 * @param {string} donationData.donorEmail - Email of the donor (optional)
 * @param {number} donationData.amount - Donation amount
 * @param {string} donationData.currency - Currency code (default: 'USD')
 * @param {string} donationData.tier - Donation tier ('coffee', 'supporter', 'first_mate')
 * @param {string} donationData.message - Optional message from donor
 * @param {string} donationData.paymentMethod - Payment method used
 * @param {string} donationData.transactionId - Payment processor transaction ID
 * @param {string} donationData.status - Payment status ('pending', 'completed', 'failed')
 * @returns {Promise<string>} Document ID of the new donation
 */
export const recordDonation = async (donationData) => {
  try {
    const donationWithTimestamp = {
      ...donationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, donationsCollection), donationWithTimestamp);
    
    // Update donation statistics
    await updateDonationStats(donationData.amount);
    
    return docRef.id;
  } catch (error) {
    console.error('Error recording donation:', error);
    throw new Error('Failed to record donation: ' + error.message);
  }
};

/**
 * Update donation statistics
 * @param {number} amount - Donation amount to add to statistics
 */
export const updateDonationStats = async (amount) => {
  try {
    const statsDocRef = doc(db, donationStatsCollection, 'current');
    const statsDoc = await getDoc(statsDocRef);

    if (statsDoc.exists()) {
      // Update existing stats
      const currentStats = statsDoc.data();
      await updateDoc(statsDocRef, {
        totalAmount: currentStats.totalAmount + amount,
        totalDonations: currentStats.totalDonations + 1,
        lastDonationAmount: amount,
        lastDonationAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new stats document
      await addDoc(collection(db, donationStatsCollection), {
        totalAmount: amount,
        totalDonations: 1,
        lastDonationAmount: amount,
        lastDonationAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating donation stats:', error);
    // Don't throw error here as it shouldn't fail the main donation recording
  }
};

/**
 * Get recent donations (for public display)
 * @param {number} limitCount - Number of recent donations to fetch
 * @returns {Promise<Array>} Array of recent donations
 */
export const getRecentDonations = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, donationsCollection),
      where('status', '==', 'completed'),
      where('showPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      donations.push({
        id: doc.id,
        donorName: data.showName ? data.donorName : 'Anonymous',
        amount: data.amount,
        tier: data.tier,
        message: data.message,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return donations;
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    throw new Error('Failed to fetch donations: ' + error.message);
  }
};

/**
 * Get donation statistics
 * @returns {Promise<Object>} Donation statistics
 */
export const getDonationStats = async () => {
  try {
    const statsDocRef = doc(db, donationStatsCollection, 'current');
    const statsDoc = await getDoc(statsDocRef);

    if (statsDoc.exists()) {
      return statsDoc.data();
    } else {
      return {
        totalAmount: 0,
        totalDonations: 0,
        lastDonationAmount: 0,
        lastDonationAt: null,
      };
    }
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    throw new Error('Failed to fetch donation statistics: ' + error.message);
  }
};

/**
 * Get donations by email (for user to see their donations)
 * @param {string} email - Donor's email
 * @returns {Promise<Array>} Array of user's donations
 */
export const getDonationsByEmail = async (email) => {
  try {
    const q = query(
      collection(db, donationsCollection),
      where('donorEmail', '==', email),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return donations;
  } catch (error) {
    console.error('Error fetching donations by email:', error);
    throw new Error('Failed to fetch user donations: ' + error.message);
  }
};

/**
 * Update donation status (for webhook handling)
 * @param {string} donationId - Document ID of the donation
 * @param {string} status - New status ('completed', 'failed')
 * @param {string} transactionId - Payment processor transaction ID
 */
export const updateDonationStatus = async (donationId, status, transactionId = null) => {
  try {
    const donationRef = doc(db, donationsCollection, donationId);
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    await updateDoc(donationRef, updateData);

    // If status is completed, update stats
    if (status === 'completed') {
      const donationDoc = await getDoc(donationRef);
      if (donationDoc.exists()) {
        const donationData = donationDoc.data();
        await updateDonationStats(donationData.amount);
      }
    }
  } catch (error) {
    console.error('Error updating donation status:', error);
    throw new Error('Failed to update donation status: ' + error.message);
  }
};