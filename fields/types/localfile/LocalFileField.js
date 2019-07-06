import Field from '../Field';
import React, { PropTypes } from 'react';
import { Button, FormField, FormInput, FormNote } from 'elemental';
import FileChangeMessage from '../../components/FileChangeMessage';
import HiddenFileInput from '../../components/HiddenFileInput';

const buildInitialState = () => ({
	action: null,
	removeExisting: false,
	userSelectedFile: null,
});

module.exports = Field.create({
	propTypes: {
		autoCleanup: PropTypes.bool,
		collapse: PropTypes.bool,
		label: PropTypes.string,
		note: PropTypes.string,
		path: PropTypes.string.isRequired,
		paths: PropTypes.shape({
			action: PropTypes.string.isRequired,
			upload: PropTypes.string.isRequired,
		}).isRequired,
		value: PropTypes.shape({
			filename: PropTypes.string,
			// TODO: these are present but not used in the UI,
			//       should we start using them?
			// filetype: PropTypes.string,
			// originalname: PropTypes.string,
			// path: PropTypes.string,
			// size: PropTypes.number,
		}),
	},
	getInitialState () {
		return buildInitialState();
	},
	shouldCollapse () {
		return this.props.collapse && !this.hasExisting();
	},

	// ==============================
	// HELPERS
	// ==============================

	hasFile () {
		return this.hasExisting() || !!this.state.userSelectedFile;
	},
	hasExisting () {
		return this.props.value && !!this.props.value.filename;
	},
	getFilename () {
		return this.state.userSelectedFile
			? this.state.userSelectedFile.name
			: this.props.value.filename;
	},

	// ==============================
	// METHODS
	// ==============================

	triggerFileBrowser () {
		this.refs.fileInput.clickDomNode();
	},
	handleFileChange (event) {
		const userSelectedFile = event.target.files[0];

		this.setState({
			userSelectedFile: userSelectedFile,
		});
	},
	handleRemove (e) {
		var state = {};

		if (this.state.userSelectedFile) {
			state.userSelectedFile = null;
		} else if (this.hasExisting()) {
			state.removeExisting = true;

			if (this.props.autoCleanup) {
				if (e.altKey) {
					state.action = 'reset';
				} else {
					state.action = 'delete';
				}
			} else {
				if (e.altKey) {
					state.action = 'delete';
				} else {
					state.action = 'reset';
				}
			}
		}

		this.setState(state);
	},
	undoRemove () {
		this.setState(buildInitialState());
	},

	// ==============================
	// RENDERERS
	// ==============================

	renderFileNameAndOptionalMessage (showChangeMessage = false) {
		return (
			<div>
				{(this.hasFile() && !this.state.removeExisting) ? (
					<FileChangeMessage>
						{this.getFilename()}
					</FileChangeMessage>
				) : null}
				{showChangeMessage && this.renderChangeMessage()}
			</div>
		);
	},
	renderChangeMessage () {
		if (this.state.userSelectedFile) {
			return (
				<FileChangeMessage type="success">
					File selected - save to upload
				</FileChangeMessage>
			);
		} else if (this.state.removeExisting) {
			return (
				<FileChangeMessage type="danger">
					File {this.props.autoCleanup ? 'deleted' : 'removed'} - save to confirm
				</FileChangeMessage>
			);
		} else {
			return null;
		}
	},
	renderClearButton () {
		if (this.state.removeExisting) {
			return (
				<Button type="link" onClick={this.undoRemove}>
					Undo Remove
				</Button>
			);
		} else {
			var clearText;
			if (this.state.userSelectedFile) {
				clearText = 'Cancel Upload';
			} else {
				clearText = (this.props.autoCleanup ? 'Delete File' : 'Remove File');
			}
			return (
				<Button type="link-cancel" onClick={this.handleRemove}>
					{clearText}
				</Button>
			);
		}
	},
	renderUI () {
		const buttons = (
			<div style={this.hasFile() ? { marginTop: '1em' } : null}>
				<Button onClick={this.triggerFileBrowser}>
					{this.hasFile() ? 'Change' : 'Upload'} File
				</Button>
				{this.hasFile() && this.renderClearButton()}
			</div>
		);

		return (
			<div data-field-name={this.props.path} data-field-type="localfile">
				<FormField label={this.props.label} htmlFor={this.props.path}>
					{this.shouldRenderField() ? (
						<div>
							{this.hasFile() && this.renderFileNameAndOptionalMessage(true)}
							{buttons}
							<HiddenFileInput
								name={this.props.paths.upload}
								onChange={this.handleFileChange}
								ref="fileInput"
							/>
							<input
								name={this.props.paths.action}
								type="hidden"
								value={this.state.action}
							/>
						</div>
					) : (
						<div>
							{this.hasFile()
								? this.renderFileNameAndOptionalMessage()
								: <FormInput noedit>no file</FormInput>}
						</div>
					)}
					{!!this.props.note && <FormNote note={this.props.note} />}
				</FormField>
			</div>
		);
	},

});
