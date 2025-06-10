
import API from '@/utils/apiClient';

export const videoAPI = {
  // 비디오 스트리밍 URL 직접 구성해서 반환
  getVideoStreamUrl: (lectureId: number) => {
    const proxyUrl = `http://localhost:9000/lectures/video/${lectureId}/stream`;
    return Promise.resolve({
      data: {
        url: proxyUrl
      }
    });
  },

  // 비디오 정보 가져오기
  getVideoInfo: (videoId: string) => {
    return API.get(`/video/${videoId}/info`);
  },

  // 시청 기록 저장
  saveWatchHistory: (videoId: string, progress: number) => {
    return API.post(`/video/${videoId}/progress`, { progress });
  }
};

