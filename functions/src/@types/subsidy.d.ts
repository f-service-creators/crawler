declare namespace subsidy {
    /**
     * 企業規模
     */
    enum business_scale {
        medium,
        small,
        private,
        other,
    }

    export interface BaseInfo {
        id: string
        name: string
    }

    export interface RemarksAddInfo extends BaseInfo {
        remarks: string
    }

    export interface Category extends BaseInfo {
        number: string
    }
    export interface industryCategory extends Category {
        sub_categories: Category[]
    }

    export interface UpdateInfo extends UpdateInfoBase {
        created_by: BaseInfo
        last_modified_by: BaseInfo
    }

    export interface Image extends BaseInfo {
        mng_group: string
        url: string
        thumbnail_url: string
        update_info: UpdateInfo
    }

    export interface Catalog extends BaseInfo {
        publisher: string
        image: Image
        published: boolean
        update_info: UpdateInfo
    }

    export interface UpdateInfoBase {
        created_at: Date
        last_modified_at: Date
    }

    export interface CompetentAuthority extends BaseInfo {
        code: string
        kind: string
        level: number
        deletable: boolean
        update_info: UpdateInfoBase
    }

    export interface Prefecture extends BaseInfo {
        region_name: string
    }

    export interface RelatedSupport {
        title: string
        url: string
    }

    export interface ServiceCategory extends BaseInfo {
        sub_categories: BaseInfo[]
    }

    export interface Disaster extends BaseInfo {
        deletable: boolean
        update_info: UpdateInfoBase
    }

    export interface TargetContent {
        mng_groups: string[]
        catalogs: Catalog[]
        publish_date: string
        language: string
        update_info: UpdateInfoBase
        has_case_studies: boolean
        title: string
        subtitle: string
        competent_authorities: CompetentAuthority[]
        number: string
        business_scales: business_scale[]
        target: string
        prefectures: Prefecture[]
        summary: string
        body: string
        usage: string
        related_supports: RelatedSupport[]
        refernece: string
        inquiry: string
        industry_categories: industryCategory[]
        stage_categories: RemarksAddInfo[]
        service_categories: ServiceCategory[]
        purpose_categories: BaseInfo[]
        life_stage_categories: RemarksAddInfo[]
        personal_service_categories: RemarksAddInfo[]
        personal_purpose_categories: BaseInfo[]
        disasters: Disaster[]
        keywords: string[]
        /** 対象者 */
        application_target: string
    }
    /**
     * @property {application_target} 対象者
     */
    export interface Item extends TargetContent {
        id: string
    }

    export interface baseResponse {
        total: number
        items: Item[]
    }
}
