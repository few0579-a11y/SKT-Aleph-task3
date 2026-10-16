
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");

const textInput = document.getElementById("textInput");
const textSize = document.getElementById("textSize");
const textColor = document.getElementById("textColor");
const textX = document.getElementById("textX");
const textY = document.getElementById("textY");

const textSizeValue = document.getElementById("textSizeValue");
const textXValue = document.getElementById("textXValue");
const textYValue = document.getElementById("textYValue");

const imageInput = document.getElementById("imageInput");
const fileMessage = document.getElementById("fileMessage");

const backgroundMode = document.getElementById("backgroundMode");
const backgroundColor = document.getElementById("backgroundColor");

const aspectRatio = document.getElementById("aspectRatio");

const imageFit = document.getElementById("imageFit");
const imageScale = document.getElementById("imageScale");
const scaleValue = document.getElementById("scaleValue");

const templateName = document.getElementById("templateName");
const saveTemplateBtn = document.getElementById("saveTemplateBtn");
const templateMessage = document.getElementById("templateMessage");
const templateSelect = document.getElementById("templateSelect");
const loadTemplateBtn = document.getElementById("loadTemplateBtn");

const exportJsonBtn = document.getElementById("exportJsonBtn");
const backupMessage = document.getElementById("backupMessage");
const importJsonInput = document.getElementById("importJsonInput");
const importJsonBtn = document.getElementById("importJsonBtn");

let currentImage = null;

// 이미지가 중앙에서 이동한 거리
let imageOffsetX = 0;
let imageOffsetY = 0;

// 드래그 상태와 직전 마우스 위치
let isDragging = false;
let lastPointerX = 0;
let lastPointerY = 0;


function wrapText(text, maxWidth) {
    const result = [];

    // 사용자가 직접 입력한 줄바꿈 유지
    const paragraphs = text.split("\n");

    paragraphs.forEach((paragraph) => {
        if (paragraph === "") {
            result.push("");
            return;
        }

        let line = "";

        // 한글·영문·이모지를 문자 단위로 처리
        for (const char of Array.from(paragraph)) {
            const testLine = line + char;

            if (
                line !== "" &&
                ctx.measureText(testLine).width > maxWidth
            ) {
                result.push(line);
                line = char;
            } else {
                line = testLine;
            }
        }

        result.push(line);
    });

    return result;
}



function drawPreview() {
    // 이전 그림을 지우고 투명하게 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 색상 배경을 선택했을 때만 배경 칠하기
    if (backgroundMode.value === "color") {
        ctx.fillStyle = backgroundColor.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 이미지가 있으면 캔버스에 그리기
    // 이미지가 있으면 캔버스에 그리기
    if (currentImage !== null) {
        const fit = imageFit.value;
        const zoom = Number(imageScale.value) / 100;

        let baseScale;

        if (fit === "contain") {
            // 이미지 전체가 보이도록 맞추기
            baseScale = Math.min(
                canvas.width / currentImage.width,
                canvas.height / currentImage.height
            );
        } else {
            // 캔버스를 빈틈없이 채우기
            baseScale = Math.max(
                canvas.width / currentImage.width,
                canvas.height / currentImage.height
            );
        }

        const width = currentImage.width * baseScale * zoom;
        const height = currentImage.height * baseScale * zoom;

        const x = (canvas.width - width) / 2 + imageOffsetX;
        const y = (canvas.height - height) / 2 + imageOffsetY;

        ctx.drawImage(currentImage, x, y, width, height);
    }


    // 사용자가 입력한 값 가져오기
    const text = textInput.value;
    const size = Number(textSize.value);
    const color = textColor.value;

    const x = canvas.width * Number(textX.value) / 100;
    const y = canvas.height * Number(textY.value) / 100;

    // 글자 스타일 설정
    ctx.fillStyle = color;
    ctx.font = `${size}px "Malgun Gothic", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    // 캔버스 너비의 90%까지만 문구 사용
    const maxWidth = canvas.width * 0.9;

    // 글자의 실제 너비를 측정해 자동 줄바꿈
    const lines = wrapText(text, maxWidth);

    // 줄 간격
    const lineHeight = size * 1.3;

    // 문구 전체가 y 좌표를 중심으로 배치되도록 계산
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    // 문구 그리기
    lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + index * lineHeight);
    });

}

// 사용자가 값을 변경하면 즉시 다시 그린다
[textInput, textSize, textColor, textX, textY].forEach((element) => {
    element.addEventListener("input", drawPreview);
});

// 처음 화면이 열릴 때 실행
drawPreview();

aspectRatio.addEventListener("change", () => {
    const ratio = aspectRatio.value;

    if (ratio === "1:1") {
        canvas.width = 600;
        canvas.height = 600;
    } else if (ratio === "4:5") {
        canvas.width = 600;
        canvas.height = 750;
    } else if (ratio === "9:16") {
        canvas.width = 540;
        canvas.height = 960;
    }

    drawPreview();
});

imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];

    if (!file) return;

    // PNG와 JPEG만 허용
    const allowedTypes = ["image/png", "image/jpeg"];

    if (!allowedTypes.includes(file.type)) {
        fileMessage.textContent =
            "지원하지 않는 파일입니다. PNG 또는 JPEG만 선택하세요.";

        imageInput.value = "";
        return;
    }

    // 실제 이미지 파일인지 확인
    let newImage;

    try {
        newImage = await createImageBitmap(file);
    } catch (error) {
        fileMessage.textContent =
            "이미지를 읽을 수 없습니다. 정상적인 이미지 파일인지 확인하세요.";

        imageInput.value = "";
        return;
    }

    // 성공했을 때만 기존 이미지 교체
    const previousImage = currentImage;
    currentImage = newImage;

    fileMessage.textContent = "이미지를 불러왔습니다.";

    drawPreview();

    // 이전 이미지 자원 정리
    if (previousImage) {
        previousImage.close();
    }
});

imageFit.addEventListener("change", drawPreview);

imageScale.addEventListener("input", () => {
    scaleValue.textContent = `${imageScale.value}%`;
    drawPreview();
});

function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height
    };
}

// 마우스로 이미지를 누르면 드래그 시작
canvas.addEventListener("pointerdown", (event) => {
    if (!currentImage) return;

    isDragging = true;

    const position = getPointerPosition(event);
    lastPointerX = position.x;
    lastPointerY = position.y;

    canvas.setPointerCapture(event.pointerId);
});

// 마우스를 누른 채 움직이면 이미지 이동
canvas.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const position = getPointerPosition(event);

    imageOffsetX += position.x - lastPointerX;
    imageOffsetY += position.y - lastPointerY;

    lastPointerX = position.x;
    lastPointerY = position.y;

    drawPreview();
});

// 마우스를 놓으면 이동 종료
function stopDragging() {
    isDragging = false;
}

canvas.addEventListener("pointerup", stopDragging);
canvas.addEventListener("pointercancel", stopDragging);
canvas.addEventListener("lostpointercapture", stopDragging);


const downloadBtn = document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", () => {
    // 최신 편집 결과를 캔버스에 반영
    drawPreview();

    // 캔버스 내용을 PNG 데이터로 변환
    canvas.toBlob((blob) => {
        if (!blob) {
            alert("이미지 저장에 실패했습니다.");
            return;
        }

        // 임시 다운로드 URL 생성
        const url = URL.createObjectURL(blob);

        // 다운로드 링크 생성
        const link = document.createElement("a");
        link.href = url;
        link.download = "my-card.png";

        // 다운로드 실행
        link.click();

        // 임시 URL 정리
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
});

backgroundMode.addEventListener("change", drawPreview);
backgroundColor.addEventListener("input", drawPreview);


// 슬라이더의 현재 설정값 표시
function updateTextValues() {
    textSizeValue.textContent = `${textSize.value}px`;
    textXValue.textContent = `${textX.value}%`;
    textYValue.textContent = `${textY.value}%`;
}

// 슬라이더를 움직이면 숫자도 변경
[textSize, textX, textY].forEach((element) => {
    element.addEventListener("input", updateTextValues);
});

// 처음 화면이 열릴 때도 숫자 표시
updateTextValues();


// 카드 4 — 템플릿 저장 기능

const TEMPLATE_STORAGE_KEY = "cardStudioTemplates";

// 브라우저에 저장된 템플릿 목록 가져오기
function getTemplates() {
    try {
        const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const templates = JSON.parse(saved);

        return Array.isArray(templates) ? templates : [];
    } catch (error) {
        console.error("템플릿을 읽지 못했습니다.", error);
        return [];
    }
}

// 템플릿 목록을 브라우저에 저장하기
function saveTemplates(templates) {
    localStorage.setItem(
        TEMPLATE_STORAGE_KEY,
        JSON.stringify(templates)
    );
}


function createTemplate() {
    const name = templateName.value.trim();

    // 이름이 비어 있으면 저장하지 않기
    if (!name) {
        templateMessage.textContent =
            "템플릿 이름을 입력해 주세요.";
        return;
    }

    // 현재 편집 설정 수집
    const newTemplate = {
        id: crypto.randomUUID(),
        name: name,

        text: textInput.value,
        textSize: Number(textSize.value),
        textColor: textColor.value,
        textX: Number(textX.value),
        textY: Number(textY.value),

        aspectRatio: aspectRatio.value,

        backgroundMode: backgroundMode.value,
        backgroundColor: backgroundColor.value,

        imageFit: imageFit.value,
        imageScale: Number(imageScale.value),
        imageOffsetX: imageOffsetX,
        imageOffsetY: imageOffsetY
    };

    // 기존 목록을 가져와 새 템플릿 추가
    const templates = getTemplates();
    templates.push(newTemplate);

    try {
        saveTemplates(templates);
    } catch (error) {
        templateMessage.textContent =
            "템플릿 저장에 실패했습니다.";
        console.error(error);
        return;
    }

    templateMessage.textContent =
        `"${name}" 템플릿이 저장되었습니다.`;

    renderTemplateList();
    templateSelect.value = newTemplate.id;
}

saveTemplateBtn.addEventListener("click", createTemplate);


function renderTemplateList() {
    const templates = getTemplates();

    // 기존 목록 초기화
    templateSelect.replaceChildren();

    // 기본 안내 항목 만들기
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "템플릿을 선택하세요";
    templateSelect.appendChild(defaultOption);

    // 저장된 템플릿을 하나씩 목록에 추가
    templates.forEach((template) => {
        const option = document.createElement("option");

        option.value = template.id;
        option.textContent = template.name;

        templateSelect.appendChild(option);
    });
}

// 페이지를 열었을 때 저장된 템플릿 목록 표시
renderTemplateList();


function loadTemplate() {
    const selectedId = templateSelect.value;

    // 템플릿을 선택하지 않았을 때
    if (!selectedId) {
        templateMessage.textContent =
            "불러올 템플릿을 선택해 주세요.";
        return;
    }

    const templates = getTemplates();

    const selectedTemplate = templates.find(
        (template) => template.id === selectedId
    );

    if (!selectedTemplate) {
        templateMessage.textContent =
            "선택한 템플릿을 찾을 수 없습니다.";
        return;
    }

    // 저장했던 문구 설정 적용
    textInput.value = selectedTemplate.text;
    textSize.value = selectedTemplate.textSize;
    textColor.value = selectedTemplate.textColor;
    textX.value = selectedTemplate.textX;
    textY.value = selectedTemplate.textY;

    // 화면비와 배경 설정 적용
    aspectRatio.value = selectedTemplate.aspectRatio;
    backgroundMode.value = selectedTemplate.backgroundMode;
    backgroundColor.value = selectedTemplate.backgroundColor;

    // 이미지 표시 설정 적용
    imageFit.value = selectedTemplate.imageFit;
    imageScale.value = selectedTemplate.imageScale;
    imageOffsetX = selectedTemplate.imageOffsetX;
    imageOffsetY = selectedTemplate.imageOffsetY;

    // 화면에 표시되는 이미지 크기 숫자 갱신
    scaleValue.textContent = `${imageScale.value}%`;

    // 화면비에 맞게 캔버스 크기 변경
    if (aspectRatio.value === "1:1") {
        canvas.width = 600;
        canvas.height = 600;
    } else if (aspectRatio.value === "4:5") {
        canvas.width = 600;
        canvas.height = 750;
    } else if (aspectRatio.value === "9:16") {
        canvas.width = 540;
        canvas.height = 960;
    }

    drawPreview();

    templateMessage.textContent =
        `"${selectedTemplate.name}" 템플릿을 불러왔습니다.`;
}

loadTemplateBtn.addEventListener("click", loadTemplate);
const updateTemplateBtn = document.getElementById("updateTemplateBtn");
const deleteTemplateBtn = document.getElementById("deleteTemplateBtn");


function updateTemplate() {
    const selectedId = templateSelect.value;

    if (!selectedId) {
        templateMessage.textContent =
            "수정할 템플릿을 선택해 주세요.";
        return;
    }

    const templates = getTemplates();

    const selectedTemplate = templates.find(
        (template) => template.id === selectedId
    );

    if (!selectedTemplate) {
        templateMessage.textContent =
            "선택한 템플릿을 찾을 수 없습니다.";
        return;
    }

    // 현재 편집 상태로 기존 템플릿 수정
    selectedTemplate.text = textInput.value;
    selectedTemplate.textSize = Number(textSize.value);
    selectedTemplate.textColor = textColor.value;
    selectedTemplate.textX = Number(textX.value);
    selectedTemplate.textY = Number(textY.value);

    selectedTemplate.aspectRatio = aspectRatio.value;
    selectedTemplate.backgroundMode = backgroundMode.value;
    selectedTemplate.backgroundColor = backgroundColor.value;

    selectedTemplate.imageFit = imageFit.value;
    selectedTemplate.imageScale = Number(imageScale.value);
    selectedTemplate.imageOffsetX = imageOffsetX;
    selectedTemplate.imageOffsetY = imageOffsetY;

    // 템플릿 이름도 수정 가능
    const newName = templateName.value.trim();

    if (newName) {
        selectedTemplate.name = newName;
    }

    try {
        saveTemplates(templates);
    } catch (error) {
        templateMessage.textContent =
            "템플릿 수정 내용을 저장하지 못했습니다.";
        console.error(error);
        return;
    }

    renderTemplateList();
    templateSelect.value = selectedId;

    templateMessage.textContent =
        `"${selectedTemplate.name}" 템플릿을 수정했습니다.`;
}

updateTemplateBtn.addEventListener("click", updateTemplate);


function deleteTemplate() {
    const selectedId = templateSelect.value;

    if (!selectedId) {
        templateMessage.textContent =
            "삭제할 템플릿을 선택해 주세요.";
        return;
    }

    const templates = getTemplates();

    const selectedTemplate = templates.find(
        (template) => template.id === selectedId
    );

    if (!selectedTemplate) {
        templateMessage.textContent =
            "선택한 템플릿을 찾을 수 없습니다.";
        return;
    }

    // 삭제 전 사용자에게 한 번 더 확인
    const confirmed = confirm(
        `"${selectedTemplate.name}" 템플릿을 삭제할까요?`
    );

    if (!confirmed) {
        templateMessage.textContent =
            "템플릿 삭제를 취소했습니다.";
        return;
    }

    // 선택한 ID를 제외한 나머지 템플릿만 남기기
    const remainingTemplates = templates.filter(
        (template) => template.id !== selectedId
    );

    try {
        saveTemplates(remainingTemplates);
    } catch (error) {
        templateMessage.textContent =
            "템플릿 삭제에 실패했습니다.";
        console.error(error);
        return;
    }

    renderTemplateList();

    templateMessage.textContent =
        `"${selectedTemplate.name}" 템플릿을 삭제했습니다.`;
}

deleteTemplateBtn.addEventListener("click", deleteTemplate);


/* 카드 5 — JSON 백업 다운로드 */

function exportTemplatesToJson() {
    const templates = getTemplates();

    if (templates.length === 0) {
        backupMessage.textContent =
            "백업할 템플릿이 없습니다.";
        return;
    }

    // 백업 파일에 저장할 데이터 구성
    const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        templates: templates
    };

    // JavaScript 객체를 JSON 문자열로 변환
    const jsonText = JSON.stringify(backupData, null, 2);

    // 다운로드할 JSON 파일 만들기
    const blob = new Blob([jsonText], {
        type: "application/json;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    // 임시 다운로드 링크 생성
    const link = document.createElement("a");
    link.href = url;
    link.download = "card-studio-backup.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    // 임시 URL 정리
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    backupMessage.textContent =
        `${templates.length}개 템플릿의 JSON 백업 다운로드를 요청했습니다.`;
}

exportJsonBtn.addEventListener("click", exportTemplatesToJson);


/* 카드 5 — JSON 백업 복원 */

async function importTemplatesFromJson() {
    const file = importJsonInput.files[0];

    if (!file) {
        backupMessage.textContent =
            "복원할 JSON 파일을 선택해 주세요.";
        return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
        backupMessage.textContent =
            "JSON 파일만 선택할 수 있습니다.";
        return;
    }

    try {
        // 파일 내용 읽기
        const jsonText = await file.text();
        const backupData = JSON.parse(jsonText);

        // 기본 구조 검사
        if (
            backupData === null ||
            typeof backupData !== "object" ||
            Array.isArray(backupData) ||
            backupData.version !== 1 ||
            !Array.isArray(backupData.templates)
        ) {
            throw new Error("지원하지 않는 백업 형식입니다.");
        }

        // 템플릿별 필수 데이터 검사
        const validTemplates = backupData.templates.every(
            (template) =>
                template !== null &&
                typeof template === "object" &&
                !Array.isArray(template) &&
                typeof template.id === "string" &&
                template.id.trim() !== "" &&
                typeof template.name === "string" &&
                typeof template.text === "string" &&
                typeof template.textSize === "number" &&
                Number.isFinite(template.textSize) &&
                typeof template.textColor === "string" &&
                typeof template.textX === "number" &&
                Number.isFinite(template.textX) &&
                typeof template.textY === "number" &&
                Number.isFinite(template.textY) &&
                ["1:1", "4:5", "9:16"].includes(template.aspectRatio) &&
                ["color", "transparent"].includes(template.backgroundMode) &&
                typeof template.backgroundColor === "string" &&
                ["contain", "cover"].includes(template.imageFit) &&
                typeof template.imageScale === "number" &&
                Number.isFinite(template.imageScale) &&
                typeof template.imageOffsetX === "number" &&
                Number.isFinite(template.imageOffsetX) &&
                typeof template.imageOffsetY === "number" &&
                Number.isFinite(template.imageOffsetY)
        );

        if (!validTemplates) {
            throw new Error("템플릿의 필수 데이터가 잘못되었습니다.");
        }

        // 중복 ID 확인
        const ids = backupData.templates.map(
            (template) => template.id
        );

        if (new Set(ids).size !== ids.length) {
            throw new Error("중복된 템플릿 ID가 있습니다.");
        }

        // 기존 데이터 교체 전 사용자 확인
        const confirmed = confirm(
            `현재 저장된 템플릿을 백업 파일의 ` +
            `${backupData.templates.length}개 템플릿으로 교체할까요?`
        );

        if (!confirmed) {
            backupMessage.textContent =
                "JSON 복원을 취소했습니다.";
            return;
        }

        // 모든 검사를 통과한 후 저장
        saveTemplates(backupData.templates);

        renderTemplateList();

        backupMessage.textContent =
            `${backupData.templates.length}개 템플릿을 복원했습니다.`;

    } catch (error) {
        backupMessage.textContent =
            `JSON 복원 실패: ${error.message}`;
        console.error(error);
    } finally {
        importJsonInput.value = "";
    }
}

importJsonBtn.addEventListener(
    "click",
    importTemplatesFromJson
);
