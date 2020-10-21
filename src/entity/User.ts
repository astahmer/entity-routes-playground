import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { AbstractEntity, Article, Role } from "@/entity/index";
import { EntityRoute, CRUD_OPERATIONS, Search } from "@astahmer/entity-routes";

@Search({ all: true })
@EntityRoute({ path: "/users", operations: CRUD_OPERATIONS })
@Entity()
export class User extends AbstractEntity {
    @Column()
    name: string;

    @OneToMany(() => Article, (article) => article.author)
    articles: Article[];

    @ManyToOne(() => Role)
    mainRole: Role;
}
