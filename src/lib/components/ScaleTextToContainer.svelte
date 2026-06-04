<script lang="ts">
  let parent: HTMLElement | undefined = $state();
  let nodes: HTMLElement[] = $state([]);
  let scale = $state(1);

  import { onMount } from "svelte";
  interface Props {
    children?: import("svelte").Snippet;
    [key: string]: unknown;
  }

  let { ...props }: Props = $props();

  function getFontSizeInPixels(element: Element): number {
    const computedStyle = window.getComputedStyle(element);
    const fontSize = computedStyle.fontSize;
    const fontSizeValue = parseFloat(fontSize);
    const fontSizeUnit = fontSize.slice(fontSizeValue.toString().length);

    if (fontSizeUnit === "px") {
      return fontSizeValue;
    } else if (fontSizeUnit === "em" || fontSizeUnit === "rem") {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return fontSizeValue * rootFontSize;
    } else if (fontSizeUnit === "%") {
      const parentFontSize = parseFloat(
        getComputedStyle(element.parentElement as Element).fontSize,
      );
      return (fontSizeValue / 100) * parentFontSize;
    } else {
      // Handle other units or fallback to a default value
      return 16; // Default font size in pixels
    }
  }

  let windowWidth: string = $state("");

  const debounce = <Args extends unknown[]>(func: (...args: Args) => void, delay: number) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const setWindowWidth = () => {
    windowWidth = `${window.innerWidth}px`;
  };

  const debouncedSetWindowWidth = debounce(setWindowWidth, 100);

  onMount(() => {
    window.addEventListener("resize", debouncedSetWindowWidth);
    return () => {
      window.removeEventListener("resize", debouncedSetWindowWidth);
    };
  });

  $effect(() => {
    void windowWidth;
    if (parent) {
      nodes = [...parent.children] as HTMLElement[];
      console.log(nodes);
      const parentWidth = parent.offsetWidth;
      let largestChildWidth = 1;
      nodes.forEach((node) => {
        if (node.offsetWidth > largestChildWidth) largestChildWidth = node.offsetWidth;
      });
      scale = parentWidth / largestChildWidth;
      nodes.forEach((node) => {
        node.style.fontSize = getFontSizeInPixels(node) * scale + "px";
      });
    }
  });
</script>

<div bind:this={parent} class="w-full transition-all {props.class || ''}" style="">
  {@render props.children?.()}
</div>
