<script lang="ts">
  import { enhance } from "$app/forms";
  import DefaultButton from "../Buttons/DefaultButton.svelte";
  import TurnstileWidget from "../TurnstileWidget.svelte";

  let {
    form,
    formTs,
  }: {
    form?: { success?: boolean; error?: string } | null;
    formTs?: number;
  } = $props();
  let submitting = $state(false);
</script>

{#if form?.success}
  <p
    role="status"
    class="w-full max-w-[720px] mt-16 text-dark border-1 border-light rounded-[3px] p-6 text-center"
  >
    Thanks — your message is on its way. We'll be in touch soon.
  </p>
{:else}
  <form
    class="w-full max-w-[720px] flex flex-col gap-4 mt-16"
    method="POST"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
  >
    {#if form?.error}
      <p role="alert" class="text-dark border-1 border-light rounded-[3px] p-4 text-center">
        {form.error}
      </p>
    {/if}

    <!-- Anti-bot: per-request timing token + a hidden honeypot. Naive bots
         fill the honeypot; a too-fast fill is caught by the timing screen. -->
    <input type="hidden" name="ts" value={formTs} />
    <input
      type="text"
      name="bot-field"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      class="hidden"
    />

    <label class="sr-only" for="contact-name">Your full name</label>
    <input
      id="contact-name"
      class="w-full border-[1px] rounded-[3px] text-dark border-light h-10 pl-4 pt-[2.5px]"
      name="name"
      placeholder="Your full name"
      type="text"
      autocomplete="name"
      required
    />

    <label class="sr-only" for="contact-email">Email address</label>
    <input
      id="contact-email"
      class="w-full border-[1px] rounded-[3px] text-dark border-light h-10 pl-4 pt-[2.5px]"
      name="email"
      placeholder="me@company.com"
      type="email"
      autocomplete="email"
      required
    />

    <label class="sr-only" for="contact-message">Your message</label>
    <textarea
      id="contact-message"
      class="border-[1px] rounded-[3px] text-dark border-light h-48 pl-4 pt-[2.5px]"
      placeholder="Your message..."
      name="message"
      required></textarea>

    <!-- Optional Cloudflare Turnstile (dark until PUBLIC_TURNSTILE_SITE_KEY is
         set — the component gates itself). Mounted inside the form so the widget
         injects its hidden cf-turnstile-response input here, which the ingest
         action forwards; verification runs centrally in the dashboard. -->
    <TurnstileWidget />

    <DefaultButton type="submit" class="w-full" disabled={submitting}>
      {submitting ? "Sending…" : "Send Message"}
    </DefaultButton>
  </form>
{/if}
