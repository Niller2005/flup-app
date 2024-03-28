<script>
	import Nav from '$lib/components/nav.svelte';
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { inject } from '@vercel/analytics';
	import { dev } from '$app/environment';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<ModeWatcher />

<main class="flex h-screen w-screen flex-col">
	<Nav />
	<slot />
</main>
