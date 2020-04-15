export default async function customReporter(opt, outputOptions, info) {
	return JSON.stringify([opt, outputOptions, info]);
}
