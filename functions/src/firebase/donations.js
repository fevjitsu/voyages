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
  updateDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../../src/firebase/config';

// Collection references
const donationsCollection = 'donations';
const donationStatsCollection = 'donationStats';

/**
 * Record a new donation in Firestore
 * @param {Object} donationData - Donation information
 * @param {string} donationData.donorName - Name of the donor
 * @param {string} donationData.donorEmail - Email of the donor
 * @param {number} donationData.amount - Donation amount
 * @param {string} donationData.currency - Currency code
 * @param {string} donationData.tier - Donation tier
 * @param {string} donationData.message - Optional message from donor
 * @param {boolean} donationData.showPublic - Whether to show publicly
 * @param {boolean} donationData.showName - Whether to show donor name
 * @param {string} donationData.paymentMethod - Payment method used
 * @param {string} donationData.status - Payment status
 * @param {string} donationData.transactionId - Payment processor transaction ID
 * @returns {Promise<string>} Document ID of the new donation
 */
export const recordDonation = async (donationData) => {
  try {
    console.log('Recording donation:', donationData);

    // Validate required fields
    if (!donationData.amount || donationData.amount <= 0) {
      throw new Error('Invalid donation amount');
    }

    if (!donationData.tier) {
      throw new Error('Donation tier is required');
    }

    const donationWithTimestamp = {
      ...donationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, donationsCollection), donationWithTimestamp);
    console.log('Donation recorded with ID:', docRef.id);

    // Update donation statistics
    await updateDonationStats(donationData.amount);

    return docRef.id;
  } catch (error) {
    console.error('Error recording donation:', error);
    throw new Error(`Failed to record donation: ${error.message}`);
  }
};

/**
 * Update donation statistics in Firestore
 * @param {number} amount - Donation amount to add to statistics
 */
const updateDonationStats = async (amount) => {
  try {
    const statsDocRef = doc(db, donationStatsCollection, 'current');

    await runTransaction(db, async (transaction) => {
      const statsDoc = await transaction.get(statsDocRef);

      if (statsDoc.exists()) {
        // Update existing stats
        const currentStats = statsDoc.data();
        transaction.update(statsDocRef, {
          totalAmount: (currentStats.totalAmount || 0) + amount,
          totalDonations: (currentStats.totalDonations || 0) + 1,
          lastDonationAmount: amount,
          lastDonationAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new stats document
        transaction.set(statsDocRef, {
          totalAmount: amount,
          totalDonations: 1,
          lastDonationAmount: amount,
          lastDonationAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });

    console.log('Donation stats updated for amount:', amount);
  } catch (error) {
    console.error('Error updating donation stats:', error);
    // Don't throw error here as it shouldn't fail the main donation recording
  }
};

/**
 * Get recent public donations for display
 * @param {number} limitCount - Number of recent donations to fetch
 * @returns {Promise<Array>} Array of recent donations
 */
export const getRecentDonations = async (limitCount = 10) => {
  try {
    console.log('Fetching recent donations, limit:', limitCount);

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
      const donation = {
        id: doc.id,
        donorName: data.showName ? (data.donorName || 'Anonymous') : 'Anonymous',
        amount: data.amount,
        currency: data.currency || 'USD',
        tier: data.tier,
        message: data.message,
        createdAt: data.createdAt?.toDate() || new Date(),
        showName: data.showName,
        showPublic: data.showPublic
      };
      donations.push(donation);
    });

    console.log(`Found ${donations.length} recent donations`);
    return donations;
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    throw new Error(`Failed to fetch donations: ${error.message}`);
  }
};

/**
 * Get donation statistics
 * @returns {Promise<Object>} Donation statistics
 */
export const getDonationStats = async () => {
  try {
    console.log('Fetching donation statistics');

    const statsDocRef = doc(db, donationStatsCollection, 'current');
    const statsDoc = await getDoc(statsDocRef);

    if (statsDoc.exists()) {
      const stats = statsDoc.data();
      console.log('Donation stats found:', stats);
      return {
        totalAmount: stats.totalAmount || 0,
        totalDonations: stats.totalDonations || 0,
        lastDonationAmount: stats.lastDonationAmount || 0,
        lastDonationAt: stats.lastDonationAt?.toDate() || null,
        updatedAt: stats.updatedAt?.toDate() || null,
      };
    } else {
      console.log('No donation stats found, returning defaults');
      return {
        totalAmount: 0,
        totalDonations: 0,
        lastDonationAmount: 0,
        lastDonationAt: null,
        updatedAt: null,
      };
    }
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    throw new Error(`Failed to fetch donation statistics: ${error.message}`);
  }
};

/**
 * Get donations by email (for users to see their own donations)
 * @param {string} email - Donor's email address
 * @returns {Promise<Array>} Array of user's donations
 */
export const getDonationsByEmail = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    console.log('Fetching donations for email:', email);

    const q = query(
      collection(db, donationsCollection),
      where('donorEmail', '==', email),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      donations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    console.log(`Found ${donations.length} donations for email: ${email}`);
    return donations;
  } catch (error) {
    console.error('Error fetching donations by email:', error);
    throw new Error(`Failed to fetch user donations: ${error.message}`);
  }
};

/**
 * Update donation status (useful for webhook handling)
 * @param {string} donationId - Document ID of the donation
 * @param {string} status - New status ('pending', 'completed', 'failed', 'refunded')
 * @param {string} transactionId - Payment processor transaction ID
 * @returns {Promise<void>}
 */
export const updateDonationStatus = async (donationId, status, transactionId = null) => {
  try {
    if (!donationId) {
      throw new Error('Donation ID is required');
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    console.log(`Updating donation ${donationId} to status: ${status}`);

    const donationRef = doc(db, donationsCollection, donationId);
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    await updateDoc(donationRef, updateData);

    // If status changed to completed, update stats
    if (status === 'completed') {
      const donationDoc = await getDoc(donationRef);
      if (donationDoc.exists()) {
        const donationData = donationDoc.data();
        await updateDonationStats(donationData.amount);
      }
    }

    console.log(`Successfully updated donation ${donationId} to ${status}`);
  } catch (error) {
    console.error('Error updating donation status:', error);
    throw new Error(`Failed to update donation status: ${error.message}`);
  }
};

/**
 * Get all donations (admin function - use with caution)
 * @param {number} limitCount - Maximum number of donations to fetch
 * @returns {Promise<Array>} Array of all donations
 */
export const getAllDonations = async (limitCount = 100) => {
  try {
    console.log('Fetching all donations, limit:', limitCount);

    const q = query(
      collection(db, donationsCollection),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      donations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    console.log(`Found ${donations.length} total donations`);
    return donations;
  } catch (error) {
    console.error('Error fetching all donations:', error);
    throw new Error(`Failed to fetch all donations: ${error.message}`);
  }
};

// Export utility functions for testing
export const donationsUtils = {
  collections: {
    donations: donationsCollection,
    stats: donationStatsCollection
  },
  updateDonationStats // Export for testing
};