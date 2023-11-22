use std::{
    collections::HashMap,
    hash::Hash,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
};

use tokio::sync::{Mutex, OwnedMutexGuard, TryLockError};

/// A lock, that locks based on a key, but lets other keys lock separately.
/// Based on a [HashMap] of [Mutex]es.
#[derive(Debug)]
pub struct KeyLock<K> {
    /// The inner map of locks for specific keys.
    locks: Mutex<HashMap<K, Arc<Mutex<()>>>>,
    /// Number of lock accesses.
    accesses: AtomicUsize,
}

impl<K> Default for KeyLock<K> {
    fn default() -> Self {
        Self {
            locks: Mutex::default(),
            accesses: AtomicUsize::default(),
        }
    }
}

impl<K> KeyLock<K>
where
    K: Eq + Hash + Send + Clone,
{
    /// Create new instance of a [KeyLock]
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Lock this key, returning a guard. Cleans up locks every 1000 accesses.
    pub async fn lock(&self, key: K) -> OwnedMutexGuard<()> {
        let mut locks = self.locks.lock().await;

        if self.accesses.fetch_add(1, Ordering::Relaxed) % 1000 == 0 {
            Self::clean_up(&mut locks);
        }

        let lock = locks
            .entry(key)
            .or_insert_with(|| Arc::new(Mutex::new(())))
            .clone();
        drop(locks);

        lock.lock_owned().await
    }

    /// Try lock this key, returning immediately. Cleans up locks every 1000
    /// accesses.
    pub async fn try_lock(&self, key: K) -> Result<OwnedMutexGuard<()>, TryLockError> {
        let mut locks = self.locks.lock().await;

        if self.accesses.fetch_add(1, Ordering::Relaxed) % 1000 == 0 {
            Self::clean_up(&mut locks);
        }

        let lock = locks
            .entry(key)
            .or_insert_with(|| Arc::new(Mutex::new(())))
            .clone();
        drop(locks);

        lock.try_lock_owned()
    }

    /// Lock this key blockingly, returning a guard. Cleans up locks every 1000
    /// accesses.
    pub fn blocking_lock(&self, key: K) -> OwnedMutexGuard<()> {
        let mut locks = self.locks.blocking_lock();

        if self.accesses.fetch_add(1, Ordering::Relaxed) % 1000 == 0 {
            Self::clean_up(&mut locks);
        }

        let lock = locks
            .entry(key)
            .or_insert_with(|| Arc::new(Mutex::new(())))
            .clone();
        drop(locks);

        lock.blocking_lock_owned()
    }

    /// Try lock this key blockingly, returning immediately. Cleans up locks
    /// every 1000 accesses.
    pub fn blocking_try_lock(&self, key: K) -> Result<OwnedMutexGuard<()>, TryLockError> {
        let mut locks = self.locks.blocking_lock();

        if self.accesses.fetch_add(1, Ordering::Relaxed) % 1000 == 0 {
            Self::clean_up(&mut locks);
        }

        let lock = locks
            .entry(key)
            .or_insert_with(|| Arc::new(Mutex::new(())))
            .clone();
        drop(locks);

        lock.try_lock_owned()
    }

    /// Clean up by removing locks that are not locked.
    pub async fn clean(&self) {
        let mut locks = self.locks.lock().await;
        Self::clean_up(&mut locks);
    }

    /// Cleanu up by removing locks that are not locked, but lock blockingly.
    pub fn blocking_clean(&self) {
        let mut locks = self.locks.blocking_lock();
        Self::clean_up(&mut locks);
    }

    /// Remove locks that are not locked currently.
    fn clean_up(locks: &mut HashMap<K, Arc<Mutex<()>>>) {
        let mut to_remove = Vec::new();
        for (key, lock) in locks.iter() {
            if lock.try_lock().is_ok() {
                to_remove.push(key.clone());
            }
        }
        for key in to_remove {
            locks.remove(&key);
        }
    }
}
