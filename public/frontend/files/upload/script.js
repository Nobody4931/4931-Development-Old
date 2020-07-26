$(document).ready(() => {
	//#region thumbnail_stuff
	var CanGenerate = true;
	var Generated = 0;
	var Content = document.getElementById("content");

	var Generate = function() {
		if (CanGenerate != true) return;

		fetch("./", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				method: "query_files",
				start: Generated,
				limit: 50
			})
		}).then(async (Response) => {
			var Data = await Response.json();
			if (Data.success == false) return Generate();
			if (Data.data == null) return Generate();

			Data.data.forEach((File) => {
				Content.innerHTML += `
				<span>
					<a href="${File.link}" target="_blank">
						<img src="${File.thumbnail}" alt="${File.identifier}">
					</a>
					${File.deletable == true ? `<a class="enabled" id="del-${File.identifier}">delete image</a>` : `<a class="disabled">unable to delete image</a>`}
				</span>`;

				// TODO: file deleting bullshit
				// also fix this garbage code
			});

			CanGenerate = true;
		}).catch(() => CanGenerate = true);
	}

	window.onscroll = (Event) =>
		(window.innerHeight + window.scrollY >= document.body.offsetHeight) ?
			Generate() : null;

	Generate();
	//#endregion thumbnail_stuff

	//#region upload_stuff
	var UplStatus = document.getElementById("upload-status");
	var FileInput = document.getElementById("input-file");

	var FileLabel = document.getElementById("label-file");
	var OrigValue = FileLabel.innerHTML;

	var CanUpload = true;

	FileInput.addEventListener("change", (Event) => {
		/* maybe some other day ¯\_(ツ)_/¯
		var FileName = Event.target.value.split("\\").pop();
		(FileName != null && FileName != "") ?
			FileLabel.innerHTML = FileName :
			FileLabel.innerHTML = OrigValue;
		*/

		if (CanUpload == false) return;
		CanUpload = false;

		var File = FileInput.files[0];
		if (File == null) return;

		var Form = new FormData();
		Form.append("uploaded_file", File);

		
		fetch("./", {
			method: "PUT",
			body: Form
		}).then(async (Response) => {
			var Data = await Response.json();
			if (Data.success == true) {
				UplStatus.style.color = "#00ff00";
				UplStatus.innerHTML = "status: success";
				setTimeout(() => window.location.href = window.location.href, 1500);
			} else {
				UplStatus.style.color = "#ff0000";
				switch (Data.error) {
					case "access_denied":
						UplStatus.innerHTML = "status: access denied (how are you even in the mainframe)";
						break;
					case "file_missing":
						UplStatus.innerHTML = "status: file missing, try again";
						break;
					case "file_size":
						UplStatus.innerHTML = "status: error - file size too big (16 mb max)";
						break;
					case "unsupported_file":
						UplStatus.innerHTML = "status: error - file type unsupported";
						break;
					case "internal_error":
						UplStatus.innerHTML = "status: error - we have no idea what happened, try again";
						break;
				}
			}
			CanUpload = true;
		}).catch(() => CanUpload = true);
	});
	//#endregion upload_stuff
});