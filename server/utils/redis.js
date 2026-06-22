const { Redis } = require('@upstash/redis');

let redis = null;

class InMemoryFallback {
    constructor() {
        this.store = new Map();
        // Periodically clean up expired keys
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (entry.expiry && now > entry.expiry) {
                this.store.delete(key);
            }
        }
    }

    async get(key) {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (entry.expiry && Date.now() > entry.expiry) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    async set(key, value, options = {}) {
        let expiry = null;
        if (options.ex) {
            expiry = Date.now() + options.ex * 1000;
        } else if (options.px) {
            expiry = Date.now() + options.px;
        }
        this.store.set(key, { value, expiry });
        return 'OK';
    }

    async incr(key) {
        const current = await this.get(key);
        const nextVal = (parseInt(current) || 0) + 1;
        const entry = this.store.get(key);
        const expiry = entry ? entry.expiry : null;
        this.store.set(key, { value: nextVal.toString(), expiry });
        return nextVal;
    }

    async expire(key, seconds) {
        const entry = this.store.get(key);
        if (entry) {
            entry.expiry = Date.now() + seconds * 1000;
            return 1;
        }
        return 0;
    }

    async del(key) {
        return this.store.delete(key) ? 1 : 0;
    }
}

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('✅ Connected to Upstash Redis');
    } catch (err) {
        console.error('❌ Failed to initialize Upstash Redis:', err.message);
        redis = new InMemoryFallback();
    }
} else {
    console.warn('⚠️ UPSTASH_REDIS_REST_URL/TOKEN not configured. Using InMemoryFallback.');
    redis = new InMemoryFallback();
}

module.exports = redis;
