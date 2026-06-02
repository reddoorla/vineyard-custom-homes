<script lang="ts">
  import DefaultButton from "./Buttons/DefaultButton.svelte";
  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
  import logomark from '$lib/assets/icons/vch-mark-lightsvg.svg'
  import logo from "$lib/assets/icons/logos/vch_logo.png"

</script>

<style>
    .gradient{
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0.01%, rgba(0, 0, 0, 0.20) 63.71%), #00263E;
    }
</style>


<footer class='w-screen pt-32 bg-dark relative'>
    <div class='h-1/6 w-full absolute bottom-0 left-0 gradient'></div>
    <ContentWidth class='flex flex-col items-center justify-center text-center relative z-10'>
        <h1 class='text-white'>BEGIN YOUR DREAM BUILD.</h1>
        <svg class='my-12' xmlns="http://www.w3.org/2000/svg" width="6" height="133" viewBox="0 0 6 133" fill="none">
            <path d="M2.99999 132.963L5.88675 127.963L0.113243 127.963L2.99999 132.963ZM2.5 -2.18557e-08L2.49999 128.463L3.49999 128.463L3.5 2.18557e-08L2.5 -2.18557e-08Z" fill="#7BA0C4"/>
        </svg>
        <DefaultButton class=' border-light text-white' href='/contact'>Let's Connect</DefaultButton>
        <img src={logomark} class='mt-12 mb-32 w-32' alt='vch logomark'/>

        <div class='w-full flex flex-col gap-5 items-start'>
            <a href='/'><img src={logo} class='h-6 md:h-9 w-auto hover:opacity-80 transition-opacity mb-5' alt='Vineyard Custom Homes — custom home builder in Eagle, Idaho' /></a>
            <a href='/about' class='text-white hover:text-light transition'>ABOUT VINEYARD</a>
            <a href='/gallery' class='text-white hover:text-light transition'>Our Work</a>
            <a href='/contact' class='text-white hover:text-light transition'>CONTACT US</a>
        </div>

        <address class='sr-only not-italic'>
            <span>Vineyard Custom Homes</span>
            <span>Custom home builder serving Eagle &amp; the Treasure Valley, Idaho</span>
            <span>12 N. Echohawk Lane, No. 102, Eagle, ID 83616</span>
            <a href='tel:+12087244034'>(208) 724-4034</a>
        </address>

        <div class='my-16 copyright text-white'>{'Copyright © '+ new Date().getFullYear() +' Vineyard Custom Homes'}</div>
    </ContentWidth>

</footer>