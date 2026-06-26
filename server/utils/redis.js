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
        this.store.set(key, { value: value.toString(), expiry });
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

class ResilientRedis {
    constructor(upstashRedis, fallback) {
        this.upstash = upstashRedis;
        this.fallback = fallback;
        this.useFallback = !upstashRedis;
    }

    async get(key) {
        if (this.useFallback) {
            return this.fallback.get(key);
        }
        try {
            return await this.upstash.get(key);
        } catch (err) {
            console.error('⚠️ Upstash Redis error on GET. Falling back to InMemoryFallback:', err.message);
            this.useFallback = true;
            return this.fallback.get(key);
        }
    }

    async set(key, value, options = {}) {
        if (this.useFallback) {
            return this.fallback.set(key, value, options);
        }
        try {
            return await this.upstash.set(key, value, options);
        } catch (err) {
            console.error('⚠️ Upstash Redis error on SET. Falling back to InMemoryFallback:', err.message);
            this.useFallback = true;
            return this.fallback.set(key, value, options);
        }
    }

    async incr(key) {
        if (this.useFallback) {
            return this.fallback.incr(key);
        }
        try {
            return await this.upstash.incr(key);
        } catch (err) {
            console.error('⚠️ Upstash Redis error on INCR. Falling back to InMemoryFallback:', err.message);
            this.useFallback = true;
            return this.fallback.incr(key);
        }
    }

    async expire(key, seconds) {
        if (this.useFallback) {
            return this.fallback.expire(key, seconds);
        }
        try {
            return await this.upstash.expire(key, seconds);
        } catch (err) {
            console.error('⚠️ Upstash Redis error on EXPIRE. Falling back to InMemoryFallback:', err.message);
            this.useFallback = true;
            return this.fallback.expire(key, seconds);
        }
    }

    async del(key) {
        if (this.useFallback) {
            return this.fallback.del(key);
        }
        try {
            return await this.upstash.del(key);
        } catch (err) {
            console.error('⚠️ Upstash Redis error on DEL. Falling back to InMemoryFallback:', err.message);
            this.useFallback = true;
            return this.fallback.del(key);
        }
    }
}

const fallback = new InMemoryFallback();

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        const upstashInstance = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        redis = new ResilientRedis(upstashInstance, fallback);
        console.log('✅ Initialized Resilient Upstash Redis client');
    } catch (err) {
        console.error('❌ Failed to initialize Upstash Redis:', err.message);
        redis = fallback;
    }
} else {
    console.warn('⚠️ UPSTASH_REDIS_REST_URL/TOKEN not configured. Using InMemoryFallback.');
    redis = fallback;
}

module.exports = redis;
