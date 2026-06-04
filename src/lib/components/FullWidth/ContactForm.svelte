<script lang="ts">
  import DefaultButton from "../Buttons/DefaultButton.svelte";

  let { PRODUCTS: _PRODUCTS = ["Apples", "Bananas", "Clementines"] } = $props();

  let form: HTMLFormElement | undefined = $state();

  let submit = () => {
    if (form) form.submit();
  };

  let _selectValue = $state("");

  //TODO: add hidden form and bind values to make this always work even if it is hidden by default
</script>

<form
  class="w-full max-w-[720px] flex flex-col gap-4 mt-16"
  name="contact"
  method="post"
  bind:this={form}
  netlify
  netlify-honeypot="bot-field"
>
  <input type="hidden" name="form-name" value="contact" />

  <input
    class="w-full border-[1px] rounded-[3px] text-dark border-light h-10 pl-4 pt-[2.5px]"
    name="name"
    placeholder="Your full name"
    type="text"
  />

  <input
    class="w-full border-[1px] rounded-[3px] text-dark border-light h-10 pl-4 pt-[2.5px]"
    name="email"
    placeholder="me@company.com"
    type="email"
  />

  <textarea
    class="border-[1px] rounded-[3px] text-dark border-light h-48 pl-4 pt-[2.5px]"
    placeholder="Your message..."
    name="message"
  ></textarea>

  <DefaultButton onclick={submit} class="w-full">Send Message</DefaultButton>
</form>
