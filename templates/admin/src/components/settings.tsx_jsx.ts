import { TemplateFunction } from "../../../../src/lib/createAdapter";
import { AdapterSettings, getDefaultAnswer } from "../../../../src/lib/questions";

function generateSettingsMethod(settings: AdapterSettings): string {
	if (settings.inputType === "select" && settings.options) {
		const options = settings.options.map((opt) => ({ value: opt.value, title: opt.text }));
		return `
				{renderSelect("${settings.label || settings.key}", "${settings.key}", ${JSON.stringify(options)})}`;
	} else if (settings.inputType === "checkbox") {
		return `
				{this.renderCheckbox("${settings.label || settings.key}", "${settings.key}")}`;
	} else {
		return `
				{this.renderInput("${settings.label || settings.key}", "${settings.key}", "${settings.inputType}")}`;
	}
}

const templateFunction: TemplateFunction = answers => {

	const useTypeScript = answers.language === "TypeScript";
	const useReact = answers.adminReact === "yes";
	if (!useReact) return;

	const adapterSettings: AdapterSettings[] = answers.adapterSettings ?? getDefaultAnswer("adapterSettings")!;

	const template = `
import ${useTypeScript ? "* as " : ""}React from "react";
import { withStyles } from "@material-ui/core/styles";
${useTypeScript ? `import { CreateCSSProperties } from "@material-ui/core/styles/withStyles";
` : ""}import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import I18n from "@iobroker/adapter-react/i18n";

${useTypeScript ? "" : `/**
 * @type {() => Record<string, import("@material-ui/core/styles/withStyles").CreateCSSProperties>}
 */`}
const styles = ()${useTypeScript ? ": Record<string, CreateCSSProperties>" : ""} => ({
	input: {
		marginTop: 0,
		minWidth: 400,
	},
	button: {
		marginRight: 20,
	},
	card: {
		maxWidth: 345,
		textAlign: "center",
	},
	media: {
		height: 180,
	},
	column: {
		display: "inline-block",
		verticalAlign: "top",
		marginRight: 20,
	},
	columnLogo: {
		width: 350,
		marginRight: 0,
	},
	columnSettings: {
		width: "calc(100% - 370px)",
	},
	controlElement: {
		//background: "#d2d2d2",
		marginBottom: 5,
	},
});

${useTypeScript ?
`interface SettingsProps {
	classes: Record<string, string>;
	native: Record<string, any>;

	onChange: (attr: string, value: any) => void;
}

interface SettingsState {
	// add your state properties here
	dummy?: undefined;
}` : `/**
 * @typedef {object} SettingsProps
 * @property {Record<string, string>} classes
 * @property {Record<string, any>} native
 * @property {(attr: string, value: any) => void} onChange
 */

/**
 * @typedef {object} SettingsState
 * @property {undefined} [dummy] Delete this and add your own state properties here
 */`}

${useTypeScript ? "" : `/**
 * @extends {React.Component<SettingsProps, SettingsState>}
 */
`}class Settings extends React.Component${useTypeScript ? "<SettingsProps, SettingsState>" : ""} {
	constructor(props${useTypeScript ? ": SettingsProps" : ""}) {
		super(props);
		this.state = {};
	}

	${useTypeScript ? `renderInput(title: string, attr: string, type: string)` : `/**
	 * @param {string} title
	 * @param {string} attr
	 * @param {string} type
	 */
	renderInput(title, attr, type)`} {
		return (
			<TextField
				label={I18n.t(title)}
				className={\`\${this.props.classes.input} \${this.props.classes.controlElement}\`}
				value={this.props.native[attr]}
				type={type || "text"}
				onChange={(e) => this.props.onChange(attr, e.target.value)}
				margin="normal"
			/>
		);
	}

	${useTypeScript ? `renderSelect(
		title: string,
		attr: string,
		options: { value: string; title: string }[],
		style?: React.CSSProperties,
	)` : `/**
	 * @param {string} title
	 * @param {string} attr
	 * @param {{ value: string; title: string }[]} options
	 * @param {React.CSSProperties} [style]
	 */
	renderSelect(title, attr, options, style)`} {
		return (
			<FormControl
				className={\`\${this.props.classes.input} \${this.props.classes.controlElement}\`}
				style={{
					paddingTop: 5,
					...style
				}}
			>
				<Select
					value={this.props.native[attr] || "_"}
					onChange={(e) => this.props.onChange(attr, e.target.value === "_" ? "" : e.target.value)}
					input={<Input name={attr} id={attr + "-helper"} />}
				>
					{options.map((item) => (
						<MenuItem key={"key-" + item.value} value={item.value || "_"}>
							{I18n.t(item.title)}
						</MenuItem>
					))}
				</Select>
				<FormHelperText>{I18n.t(title)}</FormHelperText>
			</FormControl>
		);
	}

	${useTypeScript ? `renderCheckbox(title: string, attr: string, style?: React.CSSProperties)` : `/**
	 * @param {string} title
	 * @param {string} attr
	 * @param {React.CSSProperties} [style]
	 */
	renderCheckbox(title, attr, style)`} {
		return (
			<FormControlLabel
				key={attr}
				style={{
					paddingTop: 5,
					...style
				}}
				className={this.props.classes.controlElement}
				control={
					<Checkbox
						checked={this.props.native[attr]}
						onChange={() => this.props.onChange(attr, !this.props.native[attr])}
						color="primary"
					/>
				}
				label={I18n.t(title)}
			/>
		);
	}

	render() {
		return (
			<form className={this.props.classes.tab}>${adapterSettings.map(generateSettingsMethod).join("<br />")}
			</form>
		);
	}
}

export default withStyles(styles)(Settings);
`;
	return template.trim();
};

templateFunction.customPath = (answers) => {
	const useTypeScript = answers.language === "TypeScript";
	return `admin/src/components/settings.${useTypeScript ? "tsx" : "jsx"}`;
}
export = templateFunction;


