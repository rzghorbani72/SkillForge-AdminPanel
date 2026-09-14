# Dialog actions: loading → close → toast

One rule for every dialog/modal that calls an API from a button:

1. While the request is in flight the button is disabled and shows a spinner.
2. The moment it settles — success or failure — the dialog closes.
3. The outcome is reported in a toast (react-toastify), never inside the closed dialog.

Use `edusphere/hooks/use-dialog-action.ts`:

```tsx
const { pending, run } = useDialogAction(onClose, t("common.error"));

const submit = () =>
  void run(async () => {
    const response = await fetch(url, { method: "POST", body });
    return response.ok
      ? { ok: true, message: t("x.saved") }
      : { ok: false, message: t("x.failed") };
  });
```

- Return `{ keepOpen: true }` when the answer is not an outcome yet and the user
  must choose something else first (the checkout dialog does this when the
  backend asks which bank to pay through).
- Omit `message` when the action already toasts itself — `usePurchase` does, so
  `CheckoutDialog` passes no message and only closes.
- A thrown error closes the dialog and toasts the fallback message.

In-dialog actions that are **not** the final action (applying a coupon, searching)
keep their own loading state and must not close the dialog.

Applied in edusphere: `checkout-dialog.tsx`, `report-abuse-dialog.tsx`.
AdminPanel dialogs still follow the old per-dialog pattern; migrate them to the
same hook when touched.
