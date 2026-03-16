const CHARS_PER_SMS_SEGMENT = 130;

/**
 * Approximate resolved character lengths for each template keyword.
 * Used to estimate real SMS length when content contains {keyword} placeholders.
 */
export const KEYWORD_APPROX_LENGTHS: Record<string, number> = {
    customer_name: 10,
    customer_email: 20,
    customer_phone_number: 11,
    customer_birthday: 10,
    customer_address: 20,
    customer_city: 8,
    customer_zip_code: 5,
    booking_link: 30,
    outlet_name: 12,
    outlet_address: 20,
    outlet_city: 8,
    outlet_zip_code: 5,
    outlet_phone_number: 11,
    outlet_email: 20,
    outlet_website: 25,
    outlet_facebook: 25,
    outlet_tiktok: 20,
    outlet_instagram: 20,
};

export function calculateSmsCampaignPrice({
    content,
    receivers,
    pricePerSms,
}: {
    content: string;
    receivers: number;
    pricePerSms: number;
}): number {
    // Resolve content: callers may accidentally pass the full campaign object
    const resolved =
        typeof content === 'string'
            ? content
            : typeof content === 'object' && content !== null && typeof (content as any).content === 'string'
              ? (content as any).content
              : '';

    if (resolved.trim().length === 0) {
        return 0;
    }

    // Strip HTML tags
    let text = resolved.replace(/<[^>]*>/g, '').trim();

    if (text.length === 0) {
        return 0;
    }

    // Replace each {keyword} with a string of its approximate resolved length.
    // Unknown keywords fall back to their literal keyword length.
    text = text.replace(/\{(\w+)\}/g, (_match: string, keyword: string) => {
        const approxLength = KEYWORD_APPROX_LENGTHS[keyword] ?? keyword.length;
        return 'x'.repeat(approxLength);
    });

    const approxCharCount = text.length;
    const smsCount = Math.ceil(approxCharCount / CHARS_PER_SMS_SEGMENT);
    const totalPrice = smsCount * pricePerSms * receivers;

    return totalPrice;
}
