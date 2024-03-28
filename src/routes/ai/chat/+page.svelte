<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { useChat } from 'ai/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	const { messages, handleSubmit, input, error } = useChat({ api: '/api/ai/chat' });
</script>

<section class="flex max-h-full grow flex-col gap-2 p-4">
	<div class="flex grow flex-col gap-2 overflow-y-auto">
		{#each $messages as message}
			<div
				class={`${message.role === 'user' ? 'bg-primary/50' : 'bg-muted'}  whitespace-pre-line rounded p-2`}
			>
				{message.content}
			</div>
		{/each}
	</div>

	<form on:submit={handleSubmit} class=" inset-x-4 bottom-4 flex items-center gap-4">
		<Input bind:value={$input} />
		<Button type="submit">Send</Button>
	</form>
</section>
