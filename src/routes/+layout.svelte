<script>
	import Nav from '$lib/components/nav.svelte';
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />

<main class="flex h-screen w-screen flex-col">
	<Nav />
	<slot />
</main>
