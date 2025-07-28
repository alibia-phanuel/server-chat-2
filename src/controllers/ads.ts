import axios from "axios";

export interface CallToAction {
  type: string;
  value: {
    app_destination?: string;
    link?: string;
    link_caption?: string;
  };
}

export interface LinkData {
  link: string;
  message: string;
  call_to_action?: CallToAction;
}

export interface VideoData {
  video_id: string;
  title?: string;
  message: string;
  link_description?: string;
  call_to_action?: CallToAction;
  image_url?: string;
  image_hash?: string;
  page_welcome_message?: string;
}

export interface ObjectStorySpec {
  page_id: string;
  link_data?: LinkData;
  video_data?: VideoData;
}

export interface AssetFeedSpec {
  call_to_actions: CallToAction[];
}

export interface Creative {
  id: string;
  object_story_spec?: ObjectStorySpec;
  asset_feed_spec?: AssetFeedSpec;
  effective_object_story_id: string;
}

export interface Ad {
  id: string;
  name: string;
  creative: Creative;
}

export interface AdsResponse {
  data: Ad[];
}

export const fetchAds = async (
  accountId: string,
  accessToken: string
): Promise<AdsResponse> => {
  try {
    const response = await axios.get<AdsResponse>(
      `https://graph.facebook.com/v15.0/act_${accountId}/ads?fields=id,name,creative{id,object_story_spec{page_id,link_data{link,message,call_to_action},video_data{video_id,title,message,link_description,call_to_action,image_url,image_hash,page_welcome_message}},asset_feed_spec{call_to_actions},effective_object_story_id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      "Échec de la récupération des annonces : " + (error as Error).message
    );
  }
};
