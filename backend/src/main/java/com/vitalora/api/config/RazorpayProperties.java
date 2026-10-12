package com.vitalora.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Razorpay merchant credentials — bound from app.payments.razorpay.* in
 * application.yml, which in turn read env vars (RAZORPAY_KEY_ID etc.) on prod.
 * Keeping these on a typed bean beats sprinkling @Value everywhere and makes
 * the "is a gateway configured at all?" check a one-liner.
 */
@Configuration
@ConfigurationProperties(prefix = "app.payments.razorpay")
public class RazorpayProperties {

    /** "rzp_test_…" or "rzp_live_…". Safe to send to the browser. */
    private String keyId = "";

    /** Secret HMAC key. Server-only, never surfaces to clients. */
    private String keySecret = "";

    /** Webhook secret, set in the Razorpay dashboard. Only needed if we take
     *  the webhook path in addition to the client-side verify. */
    private String webhookSecret = "";

    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank()
            && keySecret != null && !keySecret.isBlank();
    }

    public String getKeyId() { return keyId; }
    public void setKeyId(String keyId) { this.keyId = keyId; }
    public String getKeySecret() { return keySecret; }
    public void setKeySecret(String keySecret) { this.keySecret = keySecret; }
    public String getWebhookSecret() { return webhookSecret; }
    public void setWebhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; }
}
