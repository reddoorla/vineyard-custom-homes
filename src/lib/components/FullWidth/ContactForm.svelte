<script lang="ts">
  import DefaultButton from "../Buttons/DefaultButton.svelte";
</script>

<form
  class="w-full max-w-[720px] flex flex-col gap-4 mt-16"
  name="contact"
  method="post"
  netlify
  netlify-honeypot="bot-field"
>
  <input type="hidden" name="form-name" value="contact" />

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
    required
  ></textarea>

  <DefaultButton type="submit" class="w-full">Send Message</DefaultButton>
</form>
