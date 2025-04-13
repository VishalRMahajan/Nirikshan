export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'header-max-length': [2, 'always', 100], // Enforce a 100-character limit for commit messages
		'type-enum': [
			2,
			'always',
			[
				'feat',
				'fix',
				'docs',
				'style',
				'refactor',
				'perf',
				'test',
				'build',
				'ci',
				'chore',
				'revert',
			],
		],
	},
};
