import { env } from '$env/dynamic/private';
import type { RequestHandler } from '@sveltejs/kit';
import Replicate from 'replicate';
import {
	experimental_buildAnthropicPrompt,
	experimental_buildLlama2Prompt,
	experimental_buildOpenAIMessages
} from 'ai/prompts';
import { ReplicateStream, StreamingTextResponse } from 'ai';

const replicate = new Replicate({
	auth: env.REPLICATE_API_TOKEN || ''
});

export const POST = (async ({ request }) => {
	const { messages } = await request.json();
	console.log(experimental_buildAnthropicPrompt(messages));

	const response = await replicate.predictions.create({
		stream: true,
		model: 'mistralai/mixtral-8x7b-instruct-v0.1',
		input: {
			prompt: experimental_buildLlama2Prompt(messages)
		}
	});

	const stream = await ReplicateStream(response);

	return new StreamingTextResponse(stream);
}) satisfies RequestHandler;
