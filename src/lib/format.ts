const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export const formatMoney = (value: number | string) => currency.format(Number(value));
export const formatDate = (value: Date | string) => date.format(new Date(value));
