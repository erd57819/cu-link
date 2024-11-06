import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/CreateReport.css';
import Swal from 'sweetalert2';



function CreateReport() {
  const location = useLocation();
  const navigate = useNavigate();

  // 전달된 데이터 수신
  const parsedData = location.state?.parsedData;

  // 초기 데이터 설정
  const title = parsedData?.metadata.map((item) => item.cr_art_title) || [];
  const image = parsedData?.report_images.map((item, index) => {
  const cleanedImageData = item.image_data.trim();
  console.log(parsedData)
    // 오류 메시지가 포함되어 있는지 확인
    try {
      const decodedData = atob(cleanedImageData); // Base64 디코딩
      if (decodedData.includes('error')) {
        console.error(`Image ${index + 1} contains error message:`, decodedData);
        Swal.fire({
          title: "이미지 생성 오류",
          text: `Image ${index + 1} 생성 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.`,
          icon: 'error'
        });
        return null; // 오류가 발생한 이미지는 표시하지 않음
      }
    } catch (e) {
      console.error("Base64 decoding failed:", e);
      return null;
    }

    // 디버그 용도: Base64 데이터 및 최종 src 문자열 확인
    console.log(`Image ${index + 1} Base64 data:`, cleanedImageData);
    const imgSrc = `data:image/png;base64,${cleanedImageData}`;
    console.log(`Image ${index + 1} src:`, imgSrc);

    return imgSrc;
  }) || [];
  const contents = parsedData?.report_data || [];

  const [selectedTitles, setSelectedTitles] = useState(Array(title.length).fill(false));
  const [selectedImages, setSelectedImages] = useState(Array(image.length).fill(false));
  const [selectedContents, setSelectedContents] = useState(Array(contents.length).fill(false));
  const [previewContent, setPreviewContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const getSelectedIndex = (selectedArray) => selectedArray.findIndex(Boolean);

  const handleCreateReport = async () => {
    const isTitleSelected = selectedTitles.includes(true);
    const isImageSelected = selectedImages.includes(true);
    const isContentSelected = selectedContents.includes(true);

    if (!isTitleSelected || !isImageSelected || !isContentSelected) {
      let missingItems = [];
      if (!isTitleSelected) missingItems.push("Title");
      if (!isImageSelected) missingItems.push("Image");
      if (!isContentSelected) missingItems.push("Contents");

      Swal.fire({
        title: `${missingItems.join(", ")} 항목을 선택해 주세요.`,
        icon: 'warning',
      });
      return;
    }

    const selectedTitle = title[getSelectedIndex(selectedTitles)];
    const selectedImage = image[getSelectedIndex(selectedImages)];
    const selectedContent = contents[getSelectedIndex(selectedContents)];

    Swal.fire({
      title: "리포트 생성 성공 o(〃＾▽＾〃)o",
      icon: 'success'
    }).then(() => {
      sessionStorage.setItem('reportData', JSON.stringify({
        title: selectedTitle,
        image: selectedImage,
        content: selectedContent
      }));
      navigate('/report', {
        state: { title: selectedTitle, image: selectedImage, content: selectedContent }
      });
    });
  };

  const handleDoubleClick = (index) => {
    setPreviewContent(contents[index]);
    setShowPreview(true);
  };

  const handleClosePreview = () => setShowPreview(false);

  const handleSelect = (index, setSelectedState) => {
    setSelectedState((prev) => prev.map((item, i) => (i === index ? !item : false)));
  };

  return (
    <div className="create-report-container">
      <div className="report-grid">
        <div className="grid-label">Title</div>
        {title.map((item, index) => (
          <div
            key={index}
            className={`grid-item title ${selectedTitles[index] ? 'selected' : ''}`}
            onClick={() => handleSelect(index, setSelectedTitles)}
          >
            {item}
          </div>
        ))}

        <div className="grid-label">Image</div>
        {image.map((imgSrc, index) => (
          imgSrc && (
            <div
              key={index}
              className={`grid-item image ${selectedImages[index] ? 'selected' : ''}`}
              onClick={() => handleSelect(index, setSelectedImages)}
            >
              <img src={imgSrc} alt={`Report ${index + 1}`} className="image-content" />
              {selectedImages[index] && <div className="overlay"></div>}
            </div>
          )
        ))}

        <div className="grid-label">Contents</div>
        {contents.map((item, index) => (
          <div
            key={index}
            className={`grid-item content1 ${selectedContents[index] ? 'selected' : ''}`}
            onDoubleClick={() => handleDoubleClick(index)}
            onClick={() => handleSelect(index, setSelectedContents)}
          >
            {item}
          </div>
        ))}
      </div>

      {showPreview && (
        <div className="preview-popup">
          <div className="preview-header">
            <h3>미리보기</h3>
            <button onClick={handleClosePreview} className="close-button">X</button>
          </div>
          <p>{previewContent}</p>
        </div>
      )}

      <div className="create-report-button-container">
        <button
          className="create-report-button"
          onClick={handleCreateReport}
        >
          리포트 생성하기
        </button>
      </div>
    </div>
  );
}

export default CreateReport;
