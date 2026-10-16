const mongoose = require('mongoose');

/**
 * Execute an operation within a MongoDB transaction if replica set is available,
 * with automatic fallback to atomic document operations on standalone instances.
 *
 * @param {Function} operation - Async function receiving (session)
 * @returns {Promise<any>} - Result of the operation
 */
const executeWithTransactionOrFallback = async (operation) => {
  let session = null;

  try {
    session = await mongoose.startSession();
  } catch (err) {
    // If sessions cannot be started at all, run directly
    return await operation(null);
  }

  try {
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session && session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // Silently handle abort error if session already closed
      }
    }

    // Check if error is because standalone MongoDB instance does not support replica set transactions
    const isUnsupportedTransactionError =
      error.message &&
      (error.message.includes('replica set') ||
        error.message.includes('Transaction numbers are only allowed on a replica set') ||
        error.message.includes('Transactions are not supported') ||
        error.code === 20 || // IllegalOperation
        error.code === 263); // OperationNotSupportedInTransaction

    if (isUnsupportedTransactionError) {
      // Fallback safely to atomic operation without session
      return await operation(null);
    }

    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

module.exports = {
  executeWithTransactionOrFallback
};
